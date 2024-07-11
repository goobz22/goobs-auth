'use server'

import { get, remove } from 'goobs-cache'

interface UserData {
  phoneNumber: string
}

const verifyUser = async (
  phoneNumber: UserData['phoneNumber']
): Promise<boolean> => {
  if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    throw new Error('Invalid or missing phone number')
  }

  try {
    console.log('Verifying code')

    // Get the verification code from the 'verificationCode' atom
    const codeResult = await get('verificationCode', 'client')
    const code = codeResult?.value

    if (typeof code !== 'string' || code.trim() === '') {
      throw new Error('Invalid or missing verification code')
    }

    const storedCodeResult = await get(
      `sms_verification_${phoneNumber}`,
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
      await remove(`sms_verification_${phoneNumber}`, 'client')
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
