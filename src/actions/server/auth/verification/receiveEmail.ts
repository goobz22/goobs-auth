'use server'

import { getReusableStore } from 'goobs-repo'

export interface HelperFooterMessage {
  status?: 'error' | 'success'
  statusMessage?: string
  spreadMessage?: string
  spreadMessagePriority?: number
  formname?: string
}

let timeout: ReturnType<typeof setTimeout> | null = null

export async function receiveVerificationEmail(
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  console.log('Receiving verification email')
  const userEnteredVerificationCode = formData.get('verificationCode') as string
  console.log('User-entered verification code:', userEnteredVerificationCode)

  if (timeout) {
    console.log('Clearing previous timeout')
    clearTimeout(timeout)
  }

  if (!userEnteredVerificationCode) {
    console.error(
      'Verification code is empty. Please enter the verification code.'
    )
    return {
      status: 'error',
      statusMessage: 'Please enter the verification code.',
      spreadMessage: 'Verification code is required.',
      spreadMessagePriority: 1,
      formname: 'verificationForm',
    }
  }

  console.log('Creating and returning a new promise')
  return new Promise(resolve => {
    console.log('Starting timeout for verification code comparison')
    timeout = setTimeout(async () => {
      try {
        console.log('Fetching stored verification code from reusable store')
        const storedVerificationCodeResult = await getReusableStore(
          'verificationCode',
          registrationToken
        )
        const storedVerificationCode =
          storedVerificationCodeResult?.type === 'string'
            ? storedVerificationCodeResult.value
            : undefined

        console.log('Stored verification code:', storedVerificationCode)

        if (
          storedVerificationCode &&
          storedVerificationCode === userEnteredVerificationCode
        ) {
          console.log('Verification code matches')
          resolve({
            status: 'success',
            statusMessage:
              'Verification code matches. Email verified successfully.',
            formname: 'verificationForm',
          })
        } else {
          console.error(
            'Verification code does not match. Please enter the correct verification code.'
          )
          resolve({
            status: 'error',
            statusMessage:
              'Verification code does not match. Please enter the correct code.',
            spreadMessage: 'Invalid verification code.',
            spreadMessagePriority: 1,
            formname: 'verificationForm',
          })
        }
      } catch (error) {
        console.error(
          'Error occurred while comparing verification codes:',
          error
        )
        resolve({
          status: 'error',
          statusMessage:
            'An error occurred while verifying the code. Please try again.',
          spreadMessage: 'Error occurred during verification.',
          spreadMessagePriority: 1,
          formname: 'verificationForm',
        })
      }
    }, 0)
  })
}
