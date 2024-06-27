'use server'
import { getReusableStore } from 'goobs-repo'
import { sendVerificationEmail } from './../../../../../actions/server/auth/verification/sendEmail'
import { cookies } from 'next/headers'
import EmailVerification from '../../../verification/email/client'
import React from 'react'

interface ReusableStoreData {
  type: 'string'
  value: string
}

export default async function EmailVerificationPage() {
  const registrationCookie = cookies().get('registration')
  const registrationToken = registrationCookie?.value

  if (!registrationToken) {
    throw new Error('Registration token is missing')
  }

  let email = ''
  const storedData = (await getReusableStore('email', registrationToken)) as
    | ReusableStoreData
    | undefined
  if (storedData && storedData.type === 'string') {
    email = storedData.value
  }

  if (email) {
    try {
      const verificationCode = await sendVerificationEmail({
        to: email,
        registrationToken,
      })
      console.log(
        'Verification email sent. Verification code:',
        verificationCode
      )
    } catch (error) {
      console.error('Error sending verification email:', error)
    }
  }

  const onSubmitRoute = '/dashboard'
  const onBackRoute = '/auth/login'

  return (
    <EmailVerification
      email={email}
      registrationToken={registrationToken}
      onSubmitRoute={onSubmitRoute}
      onBackRoute={onBackRoute}
    />
  )
}
