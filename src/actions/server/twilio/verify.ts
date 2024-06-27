'use server'
import Twilio from 'twilio'

interface UserData {
  phoneNumber: string
}

const verifyUser = async (
  phoneNumber: UserData['phoneNumber'],
  code: string
): Promise<boolean> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!accountSid || !authToken || !serviceSid) {
    throw new Error('Twilio environment variables are not properly set')
  }

  if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    throw new Error('Invalid or missing phone number')
  }

  if (typeof code !== 'string' || code.trim() === '') {
    throw new Error('Invalid or missing verification code')
  }

  const client = Twilio(accountSid, authToken)

  try {
    console.log('Verifying code')
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code })
    console.log(`Verification result: ${verificationCheck.status}`)
    return verificationCheck.status === 'approved'
  } catch (error) {
    console.error('Error verifying code:', error)
    throw error
  }
}

export default verifyUser
