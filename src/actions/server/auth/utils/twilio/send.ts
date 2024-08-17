'use server';

import generateVerificationCode from '../generateVerificationCode';
import { session } from 'goobs-cache';
import twilio from 'twilio';
import loadAuthConfig from '../../configLoader';
import winston from 'winston';

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
    new winston.transports.File({ filename: 'sendSMS.log' }),
  ],
});

interface UserData {
  phoneNumber: string;
}

const sendSMS = async (phoneNumber: UserData['phoneNumber']): Promise<string> => {
  logger.debug('Starting sendSMS function', { phoneNumber });

  if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    logger.error('Invalid or missing phone number', { phoneNumber });
    throw new Error('Invalid or missing phone number');
  }

  try {
    // Load the auth configuration
    logger.debug('Loading auth configuration');
    const config = await loadAuthConfig();

    // Generate verification code
    logger.debug('Generating verification code');
    const verificationCode = await generateVerificationCode(6); // Assuming 6 is the desired length

    // Store the verification code using session atom from goobs-cache
    logger.debug('Storing verification code in session');
    const verificationCodeAtom = session.atom(verificationCode);
    const [, setVerificationCode] = session.useAtom(verificationCodeAtom);
    await setVerificationCode(`sms_verification_${phoneNumber}`);

    // Twilio setup using config
    logger.debug('Setting up Twilio configuration');
    const { accountSid, authToken, phoneNumber: twilioPhoneNumber } = config.twilio;
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      logger.error('Twilio configuration is not properly set in .auth.json');
      throw new Error('Twilio configuration is not properly set in .auth.json');
    }

    const client = twilio(accountSid, authToken);

    // Send SMS using Twilio
    logger.debug('Sending SMS via Twilio');
    const message = await client.messages.create({
      body: `Your verification code is: ${verificationCode}`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    logger.info('SMS sent successfully', { phoneNumber, messageSid: message.sid });
    return 'pending';
  } catch (error) {
    logger.error('Error sending SMS', {
      phoneNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

export default sendSMS;
