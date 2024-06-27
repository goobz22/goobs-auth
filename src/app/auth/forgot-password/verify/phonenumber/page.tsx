'use server'
import { getReusableStore } from 'goobs-repo'
import { cookies } from 'next/headers'
import PhoneNumberVerification from '../../../verification/phonenumber/client'
import sendSMS from './../../../../../actions/server/twilio/send'
import React from 'react'

interface ReusableStoreData {
  type: 'string'
  value: string
}

export default async function PhoneNumberVerificationPage() {
  const registrationCookie = cookies().get('registration')
  const registrationToken = registrationCookie?.value

  if (!registrationToken) {
    throw new Error('Registration token is missing')
  }

  console.log('Registration token:', registrationToken)

  let phoneNumber = ''
  console.log('Fetching stored phone number from reusable store')
  const storedPhoneNumber = (await getReusableStore(
    'phoneNumber',
    registrationToken
  )) as ReusableStoreData | undefined
  console.log('Stored phone number:', storedPhoneNumber)
  phoneNumber =
    storedPhoneNumber?.type === 'string' ? storedPhoneNumber.value : ''
  console.log('Extracted phone number:', phoneNumber)

  if (phoneNumber) {
    try {
      await sendSMS(phoneNumber)
      console.log('SMS verification sent to:', phoneNumber)
    } catch (error) {
      console.error('Error sending SMS verification:', error)
    }
  }

  const onSubmitRoute = '/dashboard'
  const onBackRoute = '/auth/forgot-password'

  return (
    <PhoneNumberVerification
      phoneNumber={phoneNumber}
      registrationToken={registrationToken}
      onSubmitRoute={onSubmitRoute}
      onBackRoute={onBackRoute}
    />
  )
}
