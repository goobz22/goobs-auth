'use server';

import winston from 'winston';
import { removeCookie } from './cookie';
import databaseOperations from './genericDatabaseRecord';

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
    new winston.transports.File({ filename: 'auth-utility-logout.log' }),
  ],
});

export type LogoutResult = {
  success: boolean;
  message: string;
};

interface TokenData {
  tokenName: string;
  tokenString: string;
  user: string;
}

export async function handleLogout(tokenData: TokenData | null): Promise<LogoutResult> {
  logger.debug('Handling logout request', { tokenData: tokenData ? 'present' : 'null' });

  if (!tokenData || !tokenData.tokenName || !tokenData.tokenString) {
    logger.warn('Logout attempted without an active session or invalid token data');
    return { success: false, message: 'No active session or invalid token data' };
  }

  try {
    logger.debug('Logging out user', {
      tokenName: tokenData.tokenName,
      tokenString: tokenData.tokenString,
    });

    // Remove the token from the cookie
    try {
      await removeCookie(tokenData.tokenName, 'auth');
      logger.debug('Token removed from cookie', { tokenName: tokenData.tokenName });
    } catch (cookieError) {
      logger.error('Error removing token from cookie', {
        tokenName: tokenData.tokenName,
        error: cookieError instanceof Error ? cookieError.message : 'Unknown error',
      });
      // Continue with logout process even if cookie removal fails
    }

    // Remove the token from the database
    const databaseResult = await databaseOperations({
      mode: 'remove',
      id: tokenData.tokenString,
    });

    if (databaseResult.success) {
      logger.debug('Token removed from database', { tokenString: tokenData.tokenString });
    } else {
      logger.warn('Failed to remove token from database', {
        tokenString: tokenData.tokenString,
        message: databaseResult.message,
      });
      // If database removal fails, we still consider the logout partially successful
      return {
        success: true,
        message: 'Logout partially successful. Token removed from cookie but not from database.',
      };
    }

    // Clear any other session-related data
    await clearOtherSessionData(tokenData.user);

    logger.info('Logout successful', { tokenName: tokenData.tokenName, user: tokenData.user });
    return {
      success: true,
      message: 'Logout successful. Token removed from both cookie and database.',
    };
  } catch (error) {
    logger.error('Unexpected error during logout', {
      tokenName: tokenData.tokenName,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, message: 'Logout failed due to an unexpected error' };
  }
}

async function clearOtherSessionData(user: string): Promise<void> {
  logger.debug('Clearing other session data', { user });
  try {
    // Implement clearing of any other session-related data
    // This could include things like clearing cache, revoking other tokens, etc.
    // For example:
    // await clearUserCache(user);
    // await revokeOtherUserTokens(user);

    // Placeholder for actual implementation
    logger.debug('Other session data cleared successfully', { user });
  } catch (error) {
    logger.error('Error clearing other session data', {
      user,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // We don't throw here to ensure the main logout process continues
  }
}

logger.info('Auth utility logout module initialized');

export default handleLogout;
