'use server'

import generateVerificationCode from '../auth/verification/generateCode'
import { setReusableStore } from 'goobs-repo'
import twilio from 'twilio'

interface UserData {
  phoneNumber: string
}

const sendSMS = async (
  phoneNumber: UserData['phoneNumber']
): Promise<string> => {
  console.log(`Original phone number: ${phoneNumber}`)
  if (typeof phoneNumber === 'string' && phoneNumber.trim() !== '') {
    try {
      const verificationCode = await generateVerificationCode()

      // Store the verification code using setReusableStore
      await setReusableStore(
        `sms_verification_${phoneNumber}`,
        { type: 'string', value: verificationCode },
        new Date(Date.now() + 10 * 60 * 1000)
      ) // 10 minutes expiration

      // Twilio setup
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

      if (!accountSid || !authToken || !twilioPhoneNumber) {
        throw new Error('Twilio environment variables are not properly set')
      }

      const client = twilio(accountSid, authToken)

      // Send SMS using Twilio
      const message = await client.messages.create({
        body: `Your verification code is: ${verificationCode}`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      })

      console.log(
        `SMS sent successfully to ${phoneNumber}. Message SID: ${message.sid}`
      )
      return 'pending'
    } catch (error) {
      console.error(`Error sending SMS to ${phoneNumber}:`, error)
      throw error
    }
  } else {
    throw new Error('Invalid or missing phone number')
  }
}

export default sendSMS
