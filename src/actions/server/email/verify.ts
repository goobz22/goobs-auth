'use server'
import { getReusableStore, deleteReusableStore } from 'goobs-repo'

interface VerifyEmailOptions {
  email: string
  code: string
}

export async function verifyEmail(
  options: VerifyEmailOptions
): Promise<boolean> {
  if (typeof options.email !== 'string' || options.email.trim() === '') {
    throw new Error('Invalid or missing email')
  }
  if (typeof options.code !== 'string' || options.code.trim() === '') {
    throw new Error('Invalid or missing verification code')
  }

  try {
    console.log('Verifying email code')
    const storedCode = await getReusableStore(
      `email_verification_${options.email}`
    )

    if (
      storedCode &&
      storedCode.type === 'string' &&
      storedCode.value === options.code
    ) {
      // Code is valid, remove it from storage
      await deleteReusableStore(`email_verification_${options.email}`)
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
