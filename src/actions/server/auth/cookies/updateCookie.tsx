import winston from 'winston';
import { cookie } from 'goobs-cache';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'updateCookie.log' }),
  ],
});

/**
 * Options for updating a cookie.
 */
interface UpdateCookieOptions {
  /** Cookie data */
  cookie: {
    /** Name of the token/cookie */
    tokenName: string;
    /** Token string value */
    tokenString: string;
    /** Flag to indicate if the cookie should be updated */
    shouldUpdateCookie?: boolean;
    /** Flag to indicate if the cookie is valid */
    isCookieValid?: boolean;
    /** Status of the cookie */
    status?: string;
  };
}

/**
 * Validates the update cookie options.
 *
 * @param options - The options for updating the cookie
 * @returns True if the options are valid, false otherwise
 */
function validateOptions(options: UpdateCookieOptions): boolean {
  const { cookie: cookieData } = options;

  if (!cookieData || typeof cookieData !== 'object') {
    logger.warn('Invalid cookie options', { options });
    return false;
  }

  if (!cookieData.tokenName || typeof cookieData.tokenName !== 'string') {
    logger.warn('Invalid tokenName', { tokenName: cookieData.tokenName });
    return false;
  }

  if (!cookieData.tokenString || typeof cookieData.tokenString !== 'string') {
    logger.warn('Invalid tokenString', { tokenString: cookieData.tokenString });
    return false;
  }

  return true;
}

/**
 * Updates a cookie in the client-side cache.
 *
 * @param options - The options for updating the cookie
 * @param identifier - The identifier for the token
 * @returns A promise that resolves when the cookie operation is completed
 */
export async function updateCookie(
  options: UpdateCookieOptions,
  identifier: string,
): Promise<void> {
  const { cookie: cookieData } = options;

  if (!validateOptions(options)) {
    logger.error('Invalid options provided to updateCookie', {
      options,
      identifier,
    });
    throw new Error('Invalid options provided to updateCookie');
  }

  const { tokenName, tokenString } = cookieData;

  try {
    const cookieAtom = cookie.atom(identifier, tokenName);
    await cookieAtom.set(tokenString);
    logger.info(`Cookie ${tokenName} updated successfully`, {
      identifier,
      tokenName,
    });
  } catch (error) {
    logger.error(`Error updating cookie ${tokenName}`, {
      identifier,
      tokenName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Removes a cookie from the client-side cache.
 *
 * @param tokenName - The name of the token/cookie
 * @param identifier - The identifier for the token
 * @returns A promise that resolves when the cookie is removed
 */
export async function removeCookie(tokenName: string, identifier: string): Promise<void> {
  try {
    const cookieAtom = cookie.atom(identifier, tokenName);
    await cookieAtom.remove();
    logger.info(`Cookie ${tokenName} removed successfully`, {
      identifier,
      tokenName,
    });
  } catch (error) {
    logger.error(`Error removing cookie ${tokenName}`, {
      identifier,
      tokenName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
