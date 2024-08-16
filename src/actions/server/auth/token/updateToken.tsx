'use server';
import crypto from 'crypto';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'updateToken.log' }),
  ],
});

export interface SerializableTokenData {
  _id?: string;
  tokenName: string;
  tokenString: string;
  user: string;
}

/**
 * Updates or generates a token based on the provided options.
 *
 * @param {Partial<SerializableTokenData>} options - The options for updating the token.
 * @returns {Promise<SerializableTokenData>} A promise that resolves to the updated token data.
 * @throws {Error} If the required options are missing or invalid.
 */
export async function updateToken(
  options: Partial<SerializableTokenData>,
): Promise<SerializableTokenData> {
  logger.debug('Starting the token update process.');
  logger.debug('Received options:', options);

  // Validate input options
  if (!options.tokenName) {
    const errorMessage = 'Token name is required.';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  const generateSecureToken = (): string => {
    return uuidv4();
  };

  const tokenData: SerializableTokenData = {
    tokenName: options.tokenName,
    tokenString: options.tokenString || '',
    user: options.user || crypto.randomUUID(),
  };

  if (options.tokenName && !options.tokenString) {
    logger.debug('Token update requested.');
    const { tokenName } = options;
    const tokenString = generateSecureToken();
    tokenData.tokenString = tokenString;
    logger.debug(`Updated ${tokenName} token in tokenData:`, tokenData);
  } else if (!options.tokenString) {
    logger.debug('Token string not provided. No update performed.');
  } else {
    logger.debug('Token update not requested or tokenString provided. Using provided data.');
  }

  return tokenData;
}
