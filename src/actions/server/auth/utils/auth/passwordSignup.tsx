'use server';

import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import databaseOperations from './genericDatabaseRecord';
import { getIPAddress } from './identity/ipaddress';
import { sendEmail } from './email/send';
import sendSMS from './twilio/send';
import { updateToken } from './token';
import { updateCookie } from './cookie';

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
    new winston.transports.File({ filename: 'signup-module.log' }),
  ],
});

export type SignupResult = {
  success: boolean;
  message: string;
  userId?: string;
};

interface UserRecord {
  id: string;
  email: string;
  phoneNumber?: string;
  passwordHash: string;
  createdAt: Date;
  lastLogin?: Date;
}

function userRecordToRecord(user: UserRecord): Record<string, unknown> {
  return {
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt.toISOString(),
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
  };
}

async function createUser(
  email: string,
  password: string,
  phoneNumber?: string,
): Promise<UserRecord> {
  const userId = uuidv4();
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MiB
    timeCost: 3,
    parallelism: 1,
  });

  const userRecord: UserRecord = {
    id: userId,
    email,
    phoneNumber,
    passwordHash,
    createdAt: new Date(),
  };

  await databaseOperations({
    mode: 'set',
    id: `user_${email}`,
    record: {
      id: `user_${email}`,
      data: userRecordToRecord(userRecord),
      lastUpdated: new Date(),
    },
  });

  return userRecord;
}

export async function signup(
  email: string,
  password: string,
  confirmPassword: string,
  phoneNumber: string,
  notificationMethod: 'email' | 'sms',
): Promise<SignupResult> {
  try {
    const ipAddress = await getIPAddress();
    logger.debug('Initiating signup', { email, ipAddress, notificationMethod });

    // Basic validation
    if (!email || !password || !confirmPassword || !phoneNumber) {
      logger.warn('Signup failed: Missing required fields', { email, ipAddress });
      return { success: false, message: 'All fields are required' };
    }

    if (password !== confirmPassword) {
      logger.warn('Signup failed: Passwords do not match', { email, ipAddress });
      return { success: false, message: 'Passwords do not match' };
    }

    // Check if user already exists
    const existingUser = await databaseOperations({
      mode: 'get',
      id: `user_${email}`,
    });

    if (existingUser.success && existingUser.record) {
      logger.warn('Signup failed: User already exists', { email, ipAddress });
      return { success: false, message: 'User with this email already exists' };
    }

    // Create new user
    const newUser = await createUser(email, password, phoneNumber);

    // Generate a token for immediate login
    const token = updateToken({
      tokenName: 'authToken',
      user: newUser.id,
    });

    // Set the token in a cookie
    updateCookie(
      {
        cookie: {
          tokenName: 'authToken',
          tokenString: token.tokenString,
          expirationInDays: 7, // Set expiration as needed
        },
      },
      'auth',
    );

    // Send welcome notification based on chosen method
    if (notificationMethod === 'email') {
      await sendEmail({
        to: email,
        subject: 'Welcome to Your App',
        html: `
          <h1>Welcome to Your App!</h1>
          <p>Your account has been successfully created.</p>
          <p>You can now log in using our passwordless login system.</p>
        `,
      });
    } else if (notificationMethod === 'sms') {
      await sendSMS(phoneNumber);
    }

    logger.info('Signup successful', { email, userId: newUser.id, ipAddress, notificationMethod });
    return {
      success: true,
      message: `Signup successful. A welcome message has been sent to your ${notificationMethod === 'email' ? 'email' : 'phone'}.`,
      userId: newUser.id,
    };
  } catch (error) {
    logger.error('Failed to process signup', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, message: 'Signup process failed due to an unexpected error' };
  }
}

logger.info('Signup module initialized');

export default signup;
