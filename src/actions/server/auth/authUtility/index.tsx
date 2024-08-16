'use server';
import winston from 'winston';
import { handleValidation, ValidateResult, SerializableTokenData } from './validate';
import { handleLogout, LogoutResult } from './logout';
import { handleLogin, LoginResult } from './login';

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
    new winston.transports.File({ filename: 'auth-utility.log' }),
  ],
});

export type AuthMode = 'validate' | 'login' | 'logout';

interface AuthUtilityOptions {
  mode: AuthMode;
  tokenData?: SerializableTokenData | null;
  tokenName?: string;
  email?: string;
  password?: string;
}

export default async function authUtility(
  options: AuthUtilityOptions,
): Promise<ValidateResult | LoginResult | LogoutResult> {
  logger.debug('Starting auth utility', { mode: options.mode });

  try {
    switch (options.mode) {
      case 'validate':
        logger.debug('Initiating token validation');
        return await handleValidation(options.tokenData ?? null, options.tokenName ?? 'loggedIn');

      case 'login':
        logger.debug('Initiating login process');
        if (!options.email || !options.password) {
          throw new Error('Email and password are required for login');
        }
        return await handleLogin(options.email, options.password);

      case 'logout':
        logger.debug('Initiating logout process');
        return await handleLogout(options.tokenData ?? null);

      default:
        logger.error('Invalid mode provided', { mode: options.mode });
        throw new Error(`Invalid mode: ${options.mode}`);
    }
  } catch (error) {
    logger.error('Error in auth utility', {
      mode: options.mode,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return a standardized error result based on the mode
    switch (options.mode) {
      case 'validate':
        return {
          isValid: false,
          validationResult: {
            token: undefined,
            cookie: undefined,
            database: undefined,
          },
          identifier: undefined,
        } as ValidateResult;

      case 'login':
        return {
          success: false,
          message: 'Login failed due to an unexpected error',
        } as LoginResult;

      case 'logout':
        return {
          success: false,
          message: 'Logout failed due to an unexpected error',
        } as LogoutResult;

      default:
        throw error; // Re-throw for unexpected modes
    }
  }
}

export { handleValidation, handleLogout, handleLogin };
export type { ValidateResult, LogoutResult, LoginResult, SerializableTokenData };

logger.info('Auth utility index module initialized');
