'use server';
import winston from 'winston';
import bcrypt from 'bcrypt';
import { updateCookie } from '../cookie';
import { updateToken, SerializableTokenData as UpdateTokenData } from '../token/updateToken';
import databaseOperations from '../database';

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
    new winston.transports.File({ filename: 'auth-utility-login.log' }),
  ],
});

export type LoginResult = {
  success: boolean;
  message: string;
  token?: UpdateTokenData;
};

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  lastLogin?: Date;
}

function isUserRecord(data: unknown): data is UserRecord {
  const user = data as UserRecord;
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.passwordHash === 'string' &&
    (user.lastLogin === undefined || user.lastLogin instanceof Date)
  );
}

async function findUserByEmail(email: string): Promise<UserRecord | null> {
  logger.debug('Looking up user by email', { email });
  const result = await databaseOperations({
    mode: 'get',
    id: `user_${email}`,
  });

  if (result.success && result.record && isUserRecord(result.record.data)) {
    return result.record.data;
  }
  logger.warn('User record not found or invalid', { email });
  return null;
}

async function updateUserLastLogin(userId: string): Promise<void> {
  logger.debug('Updating user last login', { userId });
  await databaseOperations({
    mode: 'set',
    id: `user_${userId}`,
    record: {
      id: `user_${userId}`,
      data: { lastLogin: new Date() },
      lastUpdated: new Date(),
    },
  });
}

export async function handleLogin(email?: string, password?: string): Promise<LoginResult> {
  if (!email || !password) {
    logger.warn('Login attempted without email or password');
    return { success: false, message: 'Email and password are required' };
  }

  try {
    logger.debug('Attempting login', { email });

    const user = await findUserByEmail(email);
    if (!user) {
      logger.warn('Login failed: User not found', { email });
      return { success: false, message: 'Invalid email or password' };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      logger.warn('Login failed: Incorrect password', { email });
      return { success: false, message: 'Invalid email or password' };
    }

    const token = updateToken({
      tokenName: 'loggedIn',
      tokenString: '',
      user: user.id,
    });

    logger.debug('Token generated', { tokenName: token.tokenName, tokenString: token.tokenString });

    // Store token in database
    const databaseResult = await databaseOperations({
      mode: 'set',
      id: token.tokenString,
      record: {
        id: token.tokenString,
        data: {
          userId: user.id,
          email: user.email,
          tokenName: token.tokenName,
          createdAt: new Date(),
        },
        lastUpdated: new Date(),
      },
    });

    if (!databaseResult.success) {
      logger.error('Failed to store token in database', { error: databaseResult.message });
      return { success: false, message: 'Login failed: Unable to create session' };
    }

    logger.debug('Token stored in database', { tokenString: token.tokenString });

    // Set token in cookie
    try {
      await updateCookie(
        {
          cookie: {
            tokenName: token.tokenName,
            tokenString: token.tokenString,
            shouldUpdateCookie: true,
            isCookieValid: true,
            expirationInDays: 7, // Set cookie to expire in 7 days
          },
        },
        'auth',
      );
      logger.debug('Token set in cookie', { tokenName: token.tokenName });
    } catch (cookieError) {
      logger.error('Failed to set token in cookie', {
        error: cookieError instanceof Error ? cookieError.message : 'Unknown error',
      });
      // If cookie setting fails, remove the token from the database
      await databaseOperations({
        mode: 'remove',
        id: token.tokenString,
      });
      return { success: false, message: 'Login failed: Unable to create session' };
    }

    // Update user's last login time
    await updateUserLastLogin(user.id);

    logger.info('Login successful', { email });
    return {
      success: true,
      message: 'Login successful',
      token: {
        ...token,
        user: user.id, // Ensure we're not leaking the email in the token
      },
    };
  } catch (error) {
    logger.error('Unexpected error in handleLogin', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, message: 'Login failed due to an unexpected error' };
  }
}

logger.info('Auth utility login module initialized');

export default handleLogin;
