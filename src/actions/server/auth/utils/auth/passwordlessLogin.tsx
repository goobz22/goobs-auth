'use server';

import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import databaseOperations from './genericDatabaseRecord';
import { getIPAddress } from './identity/ipaddress';
import { sendEmail } from './email/send';
import sendSMS from './twilio/send';

// Configure logger
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}] : ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
      }
      return msg;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'login-module.log' }),
  ],
});

export type LoginResult = {
  success: boolean;
  message: string;
  token?: string;
};

interface UserRecord {
  id: string;
  email: string;
  phoneNumber?: string;
  lastLogin?: Date;
  loginPreference?: 'email' | 'sms';
}

interface LoginTokenData {
  email: string;
  phoneNumber?: string;
  expiresAt: string | number | Date;
}

function isUserRecord(data: unknown): data is UserRecord {
  const user = data as UserRecord;
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    (user.phoneNumber === undefined || typeof user.phoneNumber === 'string') &&
    (user.lastLogin === undefined || user.lastLogin instanceof Date) &&
    (user.loginPreference === undefined ||
      user.loginPreference === 'email' ||
      user.loginPreference === 'sms')
  );
}

function isLoginTokenData(data: unknown): data is LoginTokenData {
  const tokenData = data as LoginTokenData;
  return (
    typeof tokenData === 'object' &&
    tokenData !== null &&
    typeof tokenData.email === 'string' &&
    (tokenData.phoneNumber === undefined || typeof tokenData.phoneNumber === 'string') &&
    (typeof tokenData.expiresAt === 'string' ||
      typeof tokenData.expiresAt === 'number' ||
      tokenData.expiresAt instanceof Date)
  );
}

function userRecordToRecord(user: UserRecord): Record<string, unknown> {
  return {
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    lastLogin: user.lastLogin?.toISOString(),
    loginPreference: user.loginPreference,
  };
}

async function findUserByEmail(email: string): Promise<UserRecord | null> {
  logger.debug('Looking up user by email', { email });
  const result = await databaseOperations({
    mode: 'get',
    id: `user_${email}`,
  });

  if (result.success && result.record && isUserRecord(result.record.data)) {
    logger.debug('User record found', { email, userId: result.record.data.id });
    return result.record.data;
  }
  logger.warn('User record not found or invalid', { email });
  return null;
}

async function createLoginToken(email: string, phoneNumber?: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  await databaseOperations({
    mode: 'set',
    id: `login_token_${token}`,
    record: {
      id: `login_token_${token}`,
      data: { email, phoneNumber, expiresAt: expiresAt.toISOString() },
      lastUpdated: new Date(),
    },
  });

  return token;
}

// Utility function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to validate phone number
function isValidPhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

export async function login(
  email: string,
  action: 'initiate' | 'verify' | 'updatePreference',
  token?: string,
  notificationMethod?: 'email' | 'sms',
  phoneNumber?: string,
  loginUrlBase?: string,
): Promise<LoginResult> {
  try {
    const ipAddress = await getIPAddress();
    logger.debug(
      `${action === 'initiate' ? 'Initiating' : action === 'verify' ? 'Verifying' : 'Updating preference for'} login`,
      {
        email,
        ipAddress,
        action,
        notificationMethod,
      },
    );

    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn('Login failed: User not found', { email, ipAddress, action });
      return { success: false, message: 'User not found' };
    }

    if (action === 'initiate') {
      if (!notificationMethod) {
        notificationMethod = user.loginPreference || 'email';
      }

      const loginToken = await createLoginToken(email, user.phoneNumber);
      const loginUrl = loginUrlBase
        ? `${loginUrlBase}/auth/verify-login/?token=${loginToken}`
        : `/auth/verify-login/?token=${loginToken}`;

      if (notificationMethod === 'email') {
        if (!isValidEmail(email)) {
          logger.warn('Invalid email address', { email, ipAddress });
          return { success: false, message: 'Invalid email address' };
        }
        await sendEmail({
          to: email,
          subject: 'Login to Your App',
          html: `
            <p>Click here to log in: <a href="${loginUrl}">${loginUrl}</a></p>
            <p>This link will expire in 15 minutes.</p>
          `,
        });
        logger.info('Login email sent', { email, ipAddress });
        return { success: true, message: 'Check your email for the login link' };
      } else if (notificationMethod === 'sms') {
        if (!user.phoneNumber) {
          logger.warn('SMS login failed: Phone number not found', { email, ipAddress });
          return { success: false, message: 'Phone number not found for this account' };
        }
        if (!isValidPhoneNumber(user.phoneNumber)) {
          logger.warn('Invalid phone number', { email, phoneNumber: user.phoneNumber, ipAddress });
          return { success: false, message: 'Invalid phone number' };
        }
        await sendSMS(user.phoneNumber);
        logger.info('Login SMS sent', { email, phoneNumber: user.phoneNumber, ipAddress });
        return { success: true, message: 'Check your phone for the login code' };
      }
    } else if (action === 'verify' && token) {
      const result = await databaseOperations({
        mode: 'get',
        id: `login_token_${token}`,
      });

      if (!result.success || !result.record || !isLoginTokenData(result.record.data)) {
        logger.warn('Invalid login token', { token, ipAddress });
        return { success: false, message: 'Invalid or expired login link' };
      }

      const { email: tokenEmail, expiresAt } = result.record.data;

      if (email !== tokenEmail) {
        logger.warn('Email mismatch', { email, tokenEmail, ipAddress });
        return { success: false, message: 'Invalid login attempt' };
      }

      const expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        logger.error('Invalid expiration date', { expiresAt, token, email, ipAddress });
        return { success: false, message: 'Invalid login token' };
      }

      if (new Date() > expirationDate) {
        logger.warn('Expired login token', { token, email, ipAddress });
        return { success: false, message: 'Login link has expired' };
      }

      // Remove the used login token
      await databaseOperations({
        mode: 'remove',
        id: `login_token_${token}`,
      });

      // Update last login time
      await databaseOperations({
        mode: 'set',
        id: `user_${email}`,
        record: {
          id: `user_${email}`,
          data: userRecordToRecord({ ...user, lastLogin: new Date() }),
          lastUpdated: new Date(),
        },
      });

      logger.info('Login verified successfully', { email, ipAddress });
      return {
        success: true,
        message: 'Login verified successfully',
        token: token, // You might want to generate a new session token here instead
      };
    } else if (action === 'updatePreference') {
      if (!notificationMethod) {
        logger.warn('Update preference failed: No notification method provided', {
          email,
          ipAddress,
        });
        return { success: false, message: 'Notification method is required' };
      }

      if (notificationMethod === 'sms' && !phoneNumber) {
        logger.warn('Update preference failed: Phone number is required for SMS preference', {
          email,
          ipAddress,
        });
        return { success: false, message: 'Phone number is required for SMS preference' };
      }

      if (notificationMethod === 'sms' && phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        logger.warn('Update preference failed: Invalid phone number', {
          email,
          phoneNumber,
          ipAddress,
        });
        return { success: false, message: 'Invalid phone number' };
      }

      const updatedUser: UserRecord = {
        ...user,
        loginPreference: notificationMethod,
        phoneNumber: notificationMethod === 'sms' ? phoneNumber : user.phoneNumber,
      };

      await databaseOperations({
        mode: 'set',
        id: `user_${email}`,
        record: {
          id: `user_${email}`,
          data: userRecordToRecord(updatedUser),
          lastUpdated: new Date(),
        },
      });

      logger.info('Login preference updated successfully', {
        email,
        notificationMethod,
        ipAddress,
      });
      return { success: true, message: 'Login preference updated successfully' };
    } else {
      logger.warn('Invalid login action or missing token', { action, email, ipAddress });
      return { success: false, message: 'Invalid login attempt' };
    }

    return { success: false, message: 'Invalid login attempt' };
  } catch (error) {
    logger.error('Failed to process login', {
      email,
      action,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, message: 'Login process failed due to an unexpected error' };
  }
}

logger.info('Login module initialized');

export default login;
