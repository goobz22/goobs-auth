'use server';

import winston from 'winston';
import { promisify } from 'util';
import crypto from 'crypto';

const randomBytes = promisify(crypto.randomBytes);

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
    new winston.transports.File({ filename: 'generateVerificationCode.log' }),
  ],
});

/**
 * Generates a random numeric verification code of a specified length.
 *
 * @param {number} length - The length of the verification code.
 * @returns {Promise<string>} A promise that resolves to the generated verification code.
 * @throws {Error} If an error occurs during the code generation process.
 */
async function generateNumericVerificationCode(length: number): Promise<string> {
  logger.debug('Starting generateNumericVerificationCode', { length });
  try {
    const digits = '0123456789';
    let code = '';
    logger.debug('Generating random digits');
    for (let i = 0; i < length; i++) {
      const randomByte = await randomBytes(1);
      const randomIndex = randomByte[0] % digits.length;
      code += digits[randomIndex];
      logger.debug(`Added digit to code`, { digit: digits[randomIndex], currentLength: i + 1 });
    }
    logger.info('Numeric verification code generated successfully', { codeLength: code.length });
    logger.debug('Generated code', { code });
    return code;
  } catch (error) {
    logger.error('Error generating numeric verification code', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      length,
    });
    throw new Error('Failed to generate numeric verification code');
  }
}

// Initialize the logger asynchronously
(async () => {
  try {
    await logger.info('generateVerificationCode module initialized');
  } catch (error) {
    console.error('Failed to initialize logger:', error);
  }
})();

export default generateNumericVerificationCode;
