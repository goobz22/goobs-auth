'use server'
import { getReusableStore } from 'goobs-repo'
import { cookies } from 'next/headers'
import RegistrationStep1 from './client'
import React from 'react'

interface ReusableStoreData {
  type: 'string'
  value: string
}

export default async function AccountInfo() {
  const registrationCookie = cookies().get('registration')
  const registrationToken = registrationCookie?.value

  if (!registrationToken) {
    throw new Error('Registration token is missing')
  }

  let firstName = ''
  let lastName = ''
  let phoneNumber = ''

  const storedFirstName = (await getReusableStore(
    'firstName',
    registrationToken
  )) as ReusableStoreData | undefined
  if (storedFirstName && storedFirstName.type === 'string') {
    firstName = storedFirstName.value
  }

  const storedLastName = (await getReusableStore(
    'lastName',
    registrationToken
  )) as ReusableStoreData | undefined
  if (storedLastName && storedLastName.type === 'string') {
    lastName = storedLastName.value
  }

  const storedPhoneNumber = (await getReusableStore(
    'phoneNumber',
    registrationToken
  )) as ReusableStoreData | undefined
  if (storedPhoneNumber && storedPhoneNumber.type === 'string') {
    phoneNumber = storedPhoneNumber.value
  }

  return (
    <RegistrationStep1
      initialFirstName={firstName}
      initialLastName={lastName}
      initialPhoneNumber={phoneNumber}
      registrationToken={registrationToken}
    />
  )
}
