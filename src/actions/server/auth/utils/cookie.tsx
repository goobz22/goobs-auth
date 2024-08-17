import winston from 'winston';
import { cookie } from 'goobs-cache';

const logger = winston.createLogger({
  level: 'debug', // Changed to debug for more detailed logging
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
    new winston.transports.File({ filename: 'updateCookie.log' }),
  ],
});

interface UpdateCookieOptions {
  cookie: {
    tokenName: string;
    tokenString: string;
    shouldUpdateCookie?: boolean;
    isCookieValid?: boolean;
    status?: string;
    expirationInDays?: number;
  };
}

function validateOptions(options: UpdateCookieOptions): boolean {
  logger.debug('Validating options', { options });
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
  if (
    cookieData.expirationInDays !== undefined &&
    (isNaN(cookieData.expirationInDays) || cookieData.expirationInDays <= 0)
  ) {
    logger.warn('Invalid expirationInDays', { expirationInDays: cookieData.expirationInDays });
    return false;
  }
  logger.debug('Options validation successful');
  return true;
}

function calculateExpirationDate(expirationInDays: number | undefined): Date | undefined {
  logger.debug('Calculating expiration date', { expirationInDays });
  if (expirationInDays === undefined) return undefined;
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expirationInDays);
  logger.debug('Expiration date calculated', { expirationDate });
  return expirationDate;
}

export function updateCookie(options: UpdateCookieOptions, identifier: string): void {
  logger.debug('Updating cookie', { options, identifier });
  const { cookie: cookieData } = options;
  if (!validateOptions(options)) {
    logger.error('Invalid options provided to updateCookie', {
      options,
      identifier,
    });
    throw new Error('Invalid options provided to updateCookie');
  }

  const { tokenName, tokenString, shouldUpdateCookie, isCookieValid, status, expirationInDays } =
    cookieData;

  if (shouldUpdateCookie === false || isCookieValid === false) {
    logger.info(`Skipping cookie update for ${tokenName}`, {
      identifier,
      tokenName,
      shouldUpdateCookie,
      isCookieValid,
    });
    return;
  }

  try {
    logger.debug('Creating cookie atom', { identifier, tokenName });
    const cookieAtom = cookie.createAtom(identifier, tokenName);
    const expirationDate = calculateExpirationDate(expirationInDays);

    const cookieValue = JSON.stringify({
      tokenString,
      status,
      expirationDate: expirationDate?.toISOString(),
    });
    logger.debug('Setting cookie value', { tokenName, cookieValue });
    cookieAtom.set(cookieValue);

    logger.info(`Cookie ${tokenName} updated successfully`, {
      identifier,
      tokenName,
      status,
      expirationDate: expirationDate?.toISOString(),
    });
  } catch (error) {
    logger.error(`Error updating cookie ${tokenName}`, {
      identifier,
      tokenName,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export function removeCookie(tokenName: string, identifier: string): void {
  logger.debug('Removing cookie', { tokenName, identifier });
  try {
    const cookieAtom = cookie.createAtom(identifier, tokenName);
    cookieAtom.remove();
    logger.info(`Cookie ${tokenName} removed successfully`, {
      identifier,
      tokenName,
    });
  } catch (error) {
    logger.error(`Error removing cookie ${tokenName}`, {
      identifier,
      tokenName,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export function getCookie(
  tokenName: string,
  identifier: string,
): { tokenString: string; status: string; expirationDate?: Date } | null {
  logger.debug('Getting cookie', { tokenName, identifier });
  try {
    const cookieAtom = cookie.createAtom(identifier, tokenName);
    const cookieValue = cookieAtom.get();

    if (!cookieValue) {
      logger.info(`Cookie ${tokenName} not found`, { identifier, tokenName });
      return null;
    }

    logger.debug('Parsing cookie value', { tokenName, cookieValue });
    const parsedCookie = JSON.parse(cookieValue.value as string);

    if (parsedCookie.expirationDate && new Date(parsedCookie.expirationDate) < new Date()) {
      logger.info(`Cookie ${tokenName} has expired`, {
        identifier,
        tokenName,
        expirationDate: parsedCookie.expirationDate,
      });
      removeCookie(tokenName, identifier);
      return null;
    }

    logger.debug('Cookie retrieved successfully', { tokenName, parsedCookie });
    return {
      tokenString: parsedCookie.tokenString,
      status: parsedCookie.status,
      expirationDate: parsedCookie.expirationDate
        ? new Date(parsedCookie.expirationDate)
        : undefined,
    };
  } catch (error) {
    logger.error(`Error getting cookie ${tokenName}`, {
      identifier,
      tokenName,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

logger.info('Initializing cookie module');
cookie.initialize();
logger.info('Cookie module initialized');
