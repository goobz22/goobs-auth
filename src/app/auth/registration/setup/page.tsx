'use server'
import { getReusableStore } from 'goobs-repo'
import { cookies } from 'next/headers'
import RegistrationSetup from './client'
import React from 'react'

interface ReusableStoreData {
  type: 'string'
  value: string
}

export default async function Setup() {
  const registrationCookie = cookies().get('registration')
  const registrationToken = registrationCookie?.value

  let email = ''

  if (registrationToken) {
    const storedData = (await getReusableStore('email', registrationToken)) as
      | ReusableStoreData
      | undefined
    if (storedData && storedData.type === 'string') {
      email = storedData.value
    }
  }

  return (
    <RegistrationSetup
      initialEmail={email}
      registrationToken={registrationToken}
    />
  )
}
