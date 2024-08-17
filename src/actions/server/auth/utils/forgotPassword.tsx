'use server';

import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import databaseOperations from './genericDatabaseRecord';
import { sendEmail } from './email/send';
import sendSMS from './twilio/send';
import { getIPAddress } from './identity/ipaddress';

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
    new winston.transports.File({ filename: 'forgot-password.log' }),
  ],
});

export type ForgotPasswordResult = {
  success: boolean;
  message: string;
};

interface UserRecord {
  id: string;
  email: string;
  phoneNumber?: string;
  loginPreference?: 'email' | 'sms';
}

function isUserRecord(data: unknown): data is UserRecord {
  const user = data as UserRecord;
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    (user.phoneNumber === undefined || typeof user.phoneNumber === 'string') &&
    (user.loginPreference === undefined ||
      user.loginPreference === 'email' ||
      user.loginPreference === 'sms')
  );
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

async function createResetToken(email: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  await databaseOperations({
    mode: 'set',
    id: `reset_token_${token}`,
    record: {
      id: `reset_token_${token}`,
      data: { email, expiresAt: expiresAt.toISOString() },
      lastUpdated: new Date(),
    },
  });

  return token;
}

async function initiatePasswordReset(email: string): Promise<ForgotPasswordResult> {
  try {
    const ipAddress = await getIPAddress();
    logger.debug('Initiating password reset', { email, ipAddress });

    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn('Password reset failed: User not found', { email, ipAddress });
      return {
        success: false,
        message: 'If a user with this email exists, a reset link has been sent.',
      };
    }

    const resetToken = await createResetToken(email);
    const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;

    if (user.loginPreference === 'sms' && user.phoneNumber) {
      await sendSMS(user.phoneNumber);
      logger.info('Password reset SMS sent', { email, phoneNumber: user.phoneNumber, ipAddress });
    } else {
      await sendEmail({
        to: email,
        subject: 'Reset Your Password',
        html: `
          <p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
        `,
      });
      logger.info('Password reset email sent', { email, ipAddress });
    }

    return {
      success: true,
      message: 'If a user with this email exists, a reset link has been sent.',
    };
  } catch (error) {
    logger.error('Failed to initiate password reset', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, message: 'An error occurred while processing your request.' };
  }
}

async function resetPassword(token: string, newPassword: string): Promise<ForgotPasswordResult> {
  try {
    const ipAddress = await getIPAddress();
    logger.debug('Resetting password', { token, ipAddress });

    const result = await databaseOperations({
      mode: 'get',
      id: `reset_token_${token}`,
    });

    if (!result.success || !result.record) {
      logger.warn('Invalid reset token', { token, ipAddress });
      return { success: false, message: 'Invalid or expired reset token.' };
    }

    const { email, expiresAt } = result.record.data as { email: string; expiresAt: string };

    if (new Date() > new Date(expiresAt)) {
      logger.warn('Expired reset token', { token, email, ipAddress });
      return { success: false, message: 'This reset token has expired.' };
    }

    // Here you would typically hash the new password before storing it
    // For this example, we'll just store it as-is (NOT recommended for production)
    await databaseOperations({
      mode: 'set',
      id: `user_${email}`,
      record: {
        id: `user_${email}`,
        data: { password: newPassword },
        lastUpdated: new Date(),
      },
    });

    // Remove the used reset token
    await databaseOperations({
      mode: 'remove',
      id: `reset_token_${token}`,
    });

    logger.info('Password reset successfully', { email, ipAddress });
    return { success: true, message: 'Your password has been reset successfully.' };
  } catch (error) {
    logger.error('Failed to reset password', {
      token,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, message: 'An error occurred while resetting your password.' };
  }
}

logger.info('Forgot password module initialized');

const forgotPasswordModule = {
  initiatePasswordReset,
  resetPassword,
};

export default forgotPasswordModule;
