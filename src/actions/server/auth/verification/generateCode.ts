'use server';
import winston from 'winston';
import crypto from 'crypto';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'generateVerificationCode.log' }),
  ],
});

/**
 * Generates a random numeric verification code of a specified length.
 *
 * @param {number} [length=6] - The length of the verification code (default: 6).
 * @returns {Promise<string>} A promise that resolves to the generated verification code.
 * @throws {Error} If an error occurs during the code generation process.
 */
export default async function generateNumericVerificationCode(length: number = 6): Promise<string> {
  logger.info('Generating numeric verification code', { length });

  try {
    const digits = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      code += digits[randomIndex];
    }

    logger.info('Numeric verification code generated successfully', { code });
    return code;
  } catch (error) {
    logger.error('Error generating numeric verification code', {
      error: (error as Error).message,
    });
    throw new Error('Failed to generate numeric verification code');
  }
}
