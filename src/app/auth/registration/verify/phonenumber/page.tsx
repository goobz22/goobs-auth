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

  let phoneNumber = ''
  const storedPhoneNumber = (await getReusableStore(
    'phoneNumber',
    registrationToken
  )) as ReusableStoreData | undefined
  if (storedPhoneNumber && storedPhoneNumber.type === 'string') {
    phoneNumber = storedPhoneNumber.value
  }

  if (phoneNumber) {
    try {
      const verificationStatus = await sendSMS(phoneNumber)
      console.log('SMS verification sent. Status:', verificationStatus)
    } catch (error) {
      console.error('Error sending SMS verification:', error)
    }
  }

  const onSubmitRoute = '/dashboard'
  const onBackRoute = '/auth/registration/accountinfo'

  return (
    <PhoneNumberVerification
      phoneNumber={phoneNumber}
      registrationToken={registrationToken}
      onSubmitRoute={onSubmitRoute}
      onBackRoute={onBackRoute}
    />
  )
}
