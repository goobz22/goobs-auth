'use server'
import { getReusableStore, deleteReusableStore } from 'goobs-repo'

interface UserData {
  phoneNumber: string
}

const verifyUser = async (
  phoneNumber: UserData['phoneNumber'],
  code: string
): Promise<boolean> => {
  if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    throw new Error('Invalid or missing phone number')
  }
  if (typeof code !== 'string' || code.trim() === '') {
    throw new Error('Invalid or missing verification code')
  }

  try {
    console.log('Verifying code')
    const storedCode = await getReusableStore(`sms_verification_${phoneNumber}`)

    if (
      storedCode &&
      storedCode.type === 'string' &&
      storedCode.value === code
    ) {
      // Code is valid, remove it from storage
      await deleteReusableStore(`sms_verification_${phoneNumber}`)
      console.log(`Verification successful for ${phoneNumber}`)
      return true
    } else {
      console.log(`Verification failed for ${phoneNumber}`)
      return false
    }
  } catch (error) {
    console.error('Error verifying code:', error)
    throw error
  }
}

export default verifyUser
