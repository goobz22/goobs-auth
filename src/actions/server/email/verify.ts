'use server'

import { get, remove } from 'goobs-cache'

interface VerifyEmailOptions {
  email: string
}

export async function verifyEmail(
  options: VerifyEmailOptions
): Promise<boolean> {
  if (typeof options.email !== 'string' || options.email.trim() === '') {
    throw new Error('Invalid or missing email')
  }

  try {
    console.log('Verifying email code')

    // Get the verification code from the 'verificationCode' atom
    const codeResult = await get('verificationCode', 'client')
    const code = codeResult?.value

    if (typeof code !== 'string' || code.trim() === '') {
      throw new Error('Invalid or missing verification code')
    }

    const storedCodeResult = await get(
      `email_verification_${options.email}`,
      'client'
    )

    if (
      storedCodeResult &&
      storedCodeResult.value &&
      typeof storedCodeResult.value === 'object' &&
      'type' in storedCodeResult.value &&
      'value' in storedCodeResult.value &&
      storedCodeResult.value.type === 'string' &&
      storedCodeResult.value.value === code
    ) {
      // Code is valid, remove it from storage
      await remove(`email_verification_${options.email}`, 'client')
      console.log(`Email verification successful for ${options.email}`)
      return true
    } else {
      console.log(`Email verification failed for ${options.email}`)
      return false
    }
  } catch (error) {
    console.error('Error verifying email code:', error)
    throw error
  }
}

export default verifyEmail
