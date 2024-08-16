'use server';

import nodemailer, { TransportOptions, SentMessageInfo } from 'nodemailer';
import generateVerificationCode from '../auth/verification/generateCode';
import { session } from 'goobs-cache';
import loadAuthConfig from '../auth/configLoader';
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
    new winston.transports.File({ filename: 'sendEmail.log' }),
  ],
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  logger.debug('Starting sendEmail function', { to: options.to, subject: options.subject });

  try {
    // Load the auth configuration
    logger.debug('Loading auth configuration');
    const config = await loadAuthConfig();

    // Generate verification code
    logger.debug('Generating verification code');
    const verificationCode = await generateVerificationCode(6); // Assuming 6 is the desired length

    // Store the verification code using session atom
    logger.debug('Storing verification code in session');
    const verificationCodeAtom = session.atom(verificationCode);
    const [, setVerificationCode] = session.useAtom(verificationCodeAtom);
    await setVerificationCode(`email_verification_${options.to}`);

    // SMTP setup using config
    logger.debug('Setting up SMTP configuration');
    const { host, port, secure, auth, from } = config.smtp;
    if (!host || !port || !auth.user || !auth.pass) {
      throw new Error('SMTP configuration is not properly set in .auth.json');
    }

    // Create a transporter using SMTP transport
    const transportOptions: TransportOptions = {
      host,
      port,
      secure,
      auth: {
        user: auth.user,
        pass: auth.pass,
      },
    } as TransportOptions;

    logger.debug('Creating nodemailer transporter');
    const transporter = nodemailer.createTransport(transportOptions);

    // Compose the email message
    const message: nodemailer.SendMailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      html: `${options.html}<br><br>Your verification code is: ${verificationCode}`,
    };

    // Send the email
    logger.debug('Sending email');
    const info: SentMessageInfo = await transporter.sendMail(message);
    logger.info('Email sent successfully', { messageId: info.messageId });
  } catch (error) {
    logger.error('Error sending email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export default sendEmail;
