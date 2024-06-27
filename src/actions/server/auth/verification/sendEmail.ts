'use server'

import { sendEmail } from '../../email/send'
import generateVerificationCode from './generateCode'
import { setReusableStore } from 'goobs-repo'

interface VerificationEmailOptions {
  to: string
  registrationToken: string
}

export async function sendVerificationEmail(
  options: VerificationEmailOptions
): Promise<string> {
  // Generate the verification code
  const verificationCode = await generateVerificationCode()

  // Compose the verification email
  const emailOptions = {
    to: options.to,
    subject: `${verificationCode} is your verification code`,
    html: `
      <p>Here is your requested verification code: ${verificationCode}</p>
    `,
  }

  // Send the verification email
  try {
    await sendEmail(emailOptions)
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }

  // Store the verification code
  try {
    await setReusableStore(
      'verificationCode',
      { type: 'string', value: verificationCode },
      new Date(Date.now() + 24 * 60 * 60 * 1000), // Expiration time: 24 hours from now
      options.registrationToken
    )
  } catch (error) {
    console.error('Error storing verification code:', error)
    throw new Error('Failed to store verification code')
  }

  // Return the verification code
  return verificationCode
}
