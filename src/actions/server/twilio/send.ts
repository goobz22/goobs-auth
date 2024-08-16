'use server';
import generateVerificationCode from '../auth/verification/generateCode';
import { session } from 'goobs-cache';
import twilio from 'twilio';
import loadAuthConfig from '../auth/configLoader';

interface UserData {
  phoneNumber: string;
}

const sendSMS = async (phoneNumber: UserData['phoneNumber']): Promise<string> => {
  console.log(`Original phone number: ${phoneNumber}`);
  if (typeof phoneNumber === 'string' && phoneNumber.trim() !== '') {
    try {
      // Load the auth configuration
      const config = await loadAuthConfig();
      const verificationCode = await generateVerificationCode();

      // Store the verification code using session atom from goobs-cache
      const verificationCodeAtom = session.atom(verificationCode);
      const [, setVerificationCode] = session.useAtom(verificationCodeAtom);
      await setVerificationCode(`sms_verification_${phoneNumber}`);

      // Twilio setup using config
      const { accountSid, authToken, phoneNumber: twilioPhoneNumber } = config.twilio;
      if (!accountSid || !authToken || !twilioPhoneNumber) {
        throw new Error('Twilio configuration is not properly set in .auth.json');
      }
      const client = twilio(accountSid, authToken);

      // Send SMS using Twilio
      const message = await client.messages.create({
        body: `Your verification code is: ${verificationCode}`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      console.log(`SMS sent successfully to ${phoneNumber}. Message SID: ${message.sid}`);
      return 'pending';
    } catch (error) {
      console.error(`Error sending SMS to ${phoneNumber}:`, error);
      throw error;
    }
  } else {
    throw new Error('Invalid or missing phone number');
  }
};

export default sendSMS;
