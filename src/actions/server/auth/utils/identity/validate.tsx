'use server';

import winston from 'winston';
import NodeCache from 'node-cache';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { getCookie, removeCookie } from '../cookie';
import databaseOperations from '../genericDatabaseRecord';

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
    new winston.transports.File({ filename: 'auth-utility-validate.log' }),
  ],
});

const tokenCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
});

logger.debug('Initialized NodeCache and RateLimiter');

export interface SerializableTokenData {
  _id?: string;
  tokenName: string;
  tokenString: string;
  tokenExpiration: Date;
  user: string;
}

export const TOKEN_STATUS = {
  VALID: 'valid',
  ONLY_COOKIE: 'onlyCookieToken',
  EXPIRED: 'cookieExpired',
  INVALID: 'invalid',
  EMPTY: 'emptyTokens',
} as const;

export type ValidationStatus = (typeof TOKEN_STATUS)[keyof typeof TOKEN_STATUS];

export interface ValidationResult {
  token?: Partial<SerializableTokenData>;
  cookie?: Partial<SerializableTokenData> & { status: ValidationStatus };
  database?: Partial<SerializableTokenData> & { status: ValidationStatus };
}

export interface Identifier {
  [key: string]: string | undefined;
}

export type GetTokenFunction = () => SerializableTokenData | null;
export type SetTokenFunction = (tokenData: SerializableTokenData | null) => void;

class InvalidTokenNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTokenNameError';
  }
}

class InvalidIdentifierError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIdentifierError';
  }
}

class RateLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitExceededError';
  }
}

export function clearTokenCache(tokenString: string): void {
  tokenCache.del(tokenString);
  logger.debug('Token cache cleared', { tokenString, action: 'clearTokenCache' });
}

async function compareCookietoDB(
  tokenName: string,
  getTokenFromDatabase: GetTokenFunction,
  setTokenInDatabase: SetTokenFunction,
  identifier: string,
): Promise<{
  validationResult: ValidationResult;
  identifier: Identifier;
  tokenData: SerializableTokenData | null;
}> {
  logger.debug('Entering compareCookietoDB', { tokenName, identifier });

  if (typeof tokenName !== 'string' || tokenName.trim() === '') {
    logger.error('Invalid token name provided', { tokenName });
    throw new InvalidTokenNameError('Invalid token name provided');
  }
  if (typeof identifier !== 'string' || identifier.trim() === '') {
    logger.error('Invalid identifier provided', { identifier });
    throw new InvalidIdentifierError('Invalid identifier provided');
  }

  try {
    logger.debug('Attempting to consume rate limiter', { identifier });
    await rateLimiter.consume(identifier);
    logger.debug('Rate limiter consumed successfully', { identifier });
  } catch (error) {
    logger.warn('Rate limit exceeded', { identifier, error: (error as Error).message });
    throw new RateLimitExceededError('Too many requests, please try again later');
  }

  logger.debug('Starting compareCookietoDB process', { tokenName, identifier });

  try {
    logger.debug('Getting token from cookie', { tokenName, identifier });
    const cookieData = getCookie(tokenName, identifier);
    const tokenString = cookieData?.tokenString;
    logger.debug('Cookie token retrieved', {
      tokenName,
      tokenStringPrefix: tokenString?.substring(0, 8),
    });

    let tokenData: SerializableTokenData | null = null;
    if (tokenString) {
      logger.debug('Attempting to retrieve token from cache', { tokenString });
      const cachedToken = tokenCache.get<SerializableTokenData>(tokenString);
      if (cachedToken !== undefined) {
        tokenData = cachedToken;
        logger.debug('Token retrieved from cache', { tokenName });
      } else {
        logger.debug('Token not found in cache, retrieving from database', { tokenName });
        tokenData = await retryOperation(() => getTokenFromDatabase());
        if (tokenData) {
          logger.debug('Caching retrieved token', { tokenName });
          tokenCache.set(tokenString, tokenData);
        }
        logger.debug('Database token retrieval complete', {
          tokenName,
          tokenDataRetrieved: !!tokenData,
        });
      }
    }

    logger.debug('Validating token', {
      tokenName,
      tokenString: !!tokenString,
      tokenData: !!tokenData,
    });
    const validationResult = validateToken(tokenName, tokenString, tokenData);
    logger.debug('Token validation complete', { tokenName, validationResult });

    if (validationResult.cookie?.status === TOKEN_STATUS.INVALID) {
      logger.debug('Attempting to remove invalid token from database', { tokenName });
      try {
        await setTokenInDatabase(null);
        await removeCookie(tokenName, identifier);
        logger.debug('Invalid token removed from database and cookie', { tokenName });
      } catch (error) {
        logger.error('Error removing invalid token from database or cookie', {
          error: (error as Error).message,
          tokenName,
        });
      }
    }

    const identifierObj: Identifier = {
      [tokenName]: validationResult.cookie?.tokenString,
    };
    logger.debug('Identifier prepared', { identifier: identifierObj });

    logger.debug('Exiting compareCookietoDB', { tokenName, identifier });
    return {
      validationResult,
      identifier: identifierObj,
      tokenData,
    };
  } catch (error) {
    if (error instanceof InvalidTokenNameError || error instanceof InvalidIdentifierError) {
      logger.error('Validation error in compareCookietoDB', {
        error: error.message,
        tokenName,
        identifier,
      });
    } else {
      logger.error('Unexpected error in compareCookietoDB', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        tokenName,
      });
    }
    throw error;
  }
}

function validateToken(
  tokenName: string,
  tokenString: string | undefined,
  tokenData: SerializableTokenData | null,
): ValidationResult {
  logger.debug('Entering validateToken', {
    tokenName,
    tokenString: !!tokenString,
    tokenData: !!tokenData,
  });

  const validationResult: ValidationResult = {
    token: {
      tokenName,
      tokenString: tokenString || '',
      tokenExpiration: tokenData?.tokenExpiration,
      user: tokenData?.user || '',
    },
    cookie: {
      tokenName,
      tokenString: tokenString || '',
      status: TOKEN_STATUS.EMPTY,
      user: tokenData?.user || '',
    },
    database: {
      tokenName,
      tokenString: tokenData?.tokenString || '',
      tokenExpiration: tokenData?.tokenExpiration,
      status: TOKEN_STATUS.EMPTY,
      user: tokenData?.user || '',
    },
  };

  logger.debug('Initial validation result', { validationResult });

  switch (true) {
    case tokenData?.tokenExpiration && tokenData.tokenExpiration < new Date():
      logger.debug('Token expired', { tokenName, expiration: tokenData.tokenExpiration });
      validationResult.cookie!.status = TOKEN_STATUS.EXPIRED;
      validationResult.database!.status = TOKEN_STATUS.EXPIRED;
      break;
    case tokenString && !tokenData:
      logger.debug('Token in cookie but not in database', { tokenName });
      validationResult.cookie!.status = TOKEN_STATUS.INVALID;
      validationResult.database!.status = TOKEN_STATUS.INVALID;
      break;
    case tokenString && tokenData && tokenData.tokenString === tokenString:
      logger.debug('Token valid in both cookie and database', { tokenName });
      validationResult.cookie!.status = TOKEN_STATUS.VALID;
      validationResult.database!.status = TOKEN_STATUS.VALID;
      break;
    default:
      logger.debug('Default case in token validation', {
        tokenName,
        tokenString: !!tokenString,
        tokenData: !!tokenData,
      });
      validationResult.cookie!.status =
        !tokenString && tokenData ? TOKEN_STATUS.ONLY_COOKIE : TOKEN_STATUS.EMPTY;
      validationResult.database!.status =
        !tokenString && tokenData ? TOKEN_STATUS.ONLY_COOKIE : TOKEN_STATUS.EMPTY;
  }

  logger.debug('Exiting validateToken', { tokenName, finalValidationResult: validationResult });
  return validationResult;
}

async function retryOperation<T>(
  operation: () => T | Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  logger.debug('Entering retryOperation', { maxRetries, initialDelay: delay });

  for (let i = 0; i < maxRetries; i++) {
    try {
      logger.debug(`Attempt ${i + 1} of ${maxRetries}`);
      const result = await Promise.resolve(operation());
      logger.debug('Operation successful', { attempt: i + 1 });
      return result;
    } catch (error) {
      if (i === maxRetries - 1) {
        logger.error('Max retries reached, throwing error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: i + 1,
        });
        throw error;
      }
      logger.warn(`Operation failed, retrying`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt: i + 1,
        nextAttempt: i + 2,
        delay: delay * Math.pow(2, i),
      });
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  logger.error('Unexpected: Reached end of retryOperation without result or thrown error');
  throw new Error('Max retries reached');
}

export type ValidateResult = {
  isValid: boolean;
  validationResult: ValidationResult;
  identifier: string | undefined;
};

async function removeInvalidToken(tokenName: string, tokenString: string): Promise<void> {
  logger.debug('Removing invalid token', { tokenName, tokenString });
  try {
    // Remove from database
    const dbResult = await databaseOperations({
      mode: 'remove',
      id: tokenString,
    });
    if (dbResult.success) {
      logger.debug('Token removed from database', { tokenString });
    } else {
      logger.warn('Failed to remove token from database', { tokenString, error: dbResult.message });
    }
    // Remove from cookie
    await removeCookie(tokenName, 'auth');
    logger.debug('Token removed from cookie', { tokenName });
  } catch (error) {
    logger.error('Error removing invalid token', {
      tokenName,
      tokenString,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function handleValidation(
  tokenData: SerializableTokenData | null,
  tokenName: string = 'loggedIn',
): Promise<ValidateResult> {
  logger.debug('Validating token', { tokenName });

  try {
    const { validationResult, identifier } = await compareCookietoDB(
      tokenName,
      () => tokenData, // This is now a synchronous function
      () => {}, // This remains synchronous
      'auth',
    );

    const isValid =
      validationResult.cookie?.status === TOKEN_STATUS.VALID &&
      validationResult.database?.status === TOKEN_STATUS.VALID &&
      validationResult.cookie?.tokenString === validationResult.database?.tokenString;

    logger.debug('Validation result', {
      tokenName,
      isValid,
      validationResult,
      identifier: identifier?.[tokenName],
    });

    if (!isValid && validationResult.cookie?.tokenString) {
      logger.warn('Token is invalid, removing from database and cookie', { tokenName });
      await removeInvalidToken(tokenName, validationResult.cookie.tokenString);
    }

    return {
      isValid,
      validationResult,
      identifier: identifier?.[tokenName],
    };
  } catch (error) {
    logger.error('Error in handleValidation', {
      tokenName,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      isValid: false,
      validationResult: {
        token: undefined,
        cookie: undefined,
        database: undefined,
      },
      identifier: undefined,
    };
  }
}

logger.info('Auth utility validate module initialized');

export default handleValidation;
