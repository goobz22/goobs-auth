'use server'
import Twilio from 'twilio'

interface UserData {
  phoneNumber: string
}

const sendSMS = async (
  phoneNumber: UserData['phoneNumber']
): Promise<string> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!accountSid || !authToken || !serviceSid) {
    throw new Error('Twilio environment variables are not properly set')
  }

  const client = Twilio(accountSid, authToken)
  console.log(`Original phone number: ${phoneNumber}`)

  if (typeof phoneNumber === 'string' && phoneNumber.trim() !== '') {
    try {
      const verification = await client.verify.v2
        .services(serviceSid)
        .verifications.create({ to: phoneNumber, channel: 'sms' })
      console.log(`SMS sent successfully to ${phoneNumber}`)
      return verification.status
    } catch (error) {
      console.error(`Error sending SMS to ${phoneNumber}:`, error)
      throw error
    }
  } else {
    throw new Error('Invalid or missing phone number')
  }
}

export default sendSMS
