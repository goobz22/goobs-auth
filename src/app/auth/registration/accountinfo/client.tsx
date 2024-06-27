'use client'

import React, { useState } from 'react'
import { Box, Dialog } from '@mui/material'
import { registrationServerAction } from './../../../../actions/server/user/registration/action'
import { useRouter } from 'next/navigation'
import {
  ContentSection,
  formContainerStyle,
  Alignment,
  Animation,
  black,
  white,
  TypographyPropsVariantOverrides,
} from 'goobs-repo'

interface RegistrationStep1Props {
  initialFirstName: string
  initialLastName: string
  initialPhoneNumber: string
  registrationToken: string
}

interface HelperFooterMessage {
  status?: 'error' | 'success'
  statusMessage?: string
  spreadMessage?: string
  spreadMessagePriority?: number
  formname?: string
}

export default function RegistrationStep1({
  initialFirstName,
  initialLastName,
  initialPhoneNumber,
  registrationToken,
}: RegistrationStep1Props) {
  const router = useRouter()

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [helperFooters, setHelperFooters] = useState<{
    firstName?: HelperFooterMessage
    lastName?: HelperFooterMessage
    phoneNumber?: HelperFooterMessage
  }>({})

  const handleFirstNameChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFirstName(event.target.value)
  }

  const handleLastNameChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLastName(event.target.value)
  }

  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPhoneNumber(event.target.value)
  }

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('firstName', firstName)
    formData.append('lastName', lastName)
    formData.append('phoneNumber', phoneNumber)

    const firstNameResult = await registrationServerAction(
      'firstNameErrorCreation',
      formData,
      registrationToken
    )
    const lastNameResult = await registrationServerAction(
      'lastNameErrorCreation',
      formData,
      registrationToken
    )
    const phoneNumberResult = await registrationServerAction(
      'phoneNumberErrorCreation',
      formData,
      registrationToken
    )

    setHelperFooters({
      firstName: firstNameResult || undefined,
      lastName: lastNameResult || undefined,
      phoneNumber: phoneNumberResult || undefined,
    })

    if (
      firstNameResult?.status === 'error' ||
      lastNameResult?.status === 'error' ||
      phoneNumberResult?.status === 'error'
    ) {
      console.log('Form has errors. Cannot proceed to the next step.')
      return
    }

    console.log(`Advancing to next step from current step.`)
    router.push('/auth/registration/verify/phonenumber')
  }

  const handleBack = () => {
    router.push('/auth/registration')
  }

  const contentSectionProps = {
    grids: [
      {
        grid: {
          gridconfig: {
            gridname: 'accountCreation',
            alignment: 'left' as Alignment,
            marginbottom: 1,
            gridwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        bodytitle: {
          fontcolor: black.main,
          text: 'Create your account',
          columnconfig: {
            row: 1,
            column: 1,
            gridname: 'accountCreation',
            alignment: 'left' as Alignment,
            columnwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        paragraph: [
          {
            fontcolor: black.main,
            text: 'Tell us a bit more about you.',
            columnconfig: {
              row: 2,
              column: 1,
              gridname: 'accountCreation',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              animation: 'none' as Animation,
            },
          },
          {
            fontcolor: black.main,
            text: 'When you click continue you agree to a verification email and text being sent to you. By clicking continue you do not agree to us sending you spam this is only used for security and to protect your account.',
            columnconfig: {
              row: 3,
              column: 1,
              gridname: 'accountCreation',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              animation: 'none' as Animation,
            },
          },
          {
            fontcolor: black.main,
            text: 'Spam annoys us also',
            columnconfig: {
              row: 4,
              column: 1,
              gridname: 'accountCreation',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              animation: 'none' as Animation,
            },
          },
        ],
        styledcomponent: [
          {
            label: 'First Name',
            outlinecolor: black.main,
            componentvariant: 'textfield' as const,
            name: 'firstName',
            value: firstName,
            formname: 'step1form',
            width: '100%',
            columnconfig: {
              row: 5,
              column: 1,
              gridname: 'accountCreation',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              margintop: 1,
              animation: 'none' as Animation,
            },
            onChange: handleFirstNameChange,
            helperfooter: helperFooters.firstName,
          },
          {
            label: 'Last Name',
            outlinecolor: black.main,
            componentvariant: 'textfield' as const,
            name: 'lastName',
            formname: 'step1form',
            value: lastName,
            width: '100%',
            columnconfig: {
              row: 6,
              column: 1,
              gridname: 'accountCreation',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              animation: 'none' as Animation,
            },
            onChange: handleLastNameChange,
            helperfooter: helperFooters.lastName,
          },
          {
            label: 'Phone Number',
            outlinecolor: black.main,
            componentvariant: 'phonenumber' as const,
            name: 'phoneNumber',
            formname: 'step1form',
            width: '100%',
            value: phoneNumber,
            columnconfig: {
              row: 7,
              column: 1,
              gridname: 'accountCreation',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              animation: 'none' as Animation,
            },
            onChange: handlePhoneNumberChange,
            helperfooter: helperFooters.phoneNumber,
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'step1Actions',
            alignment: 'center' as Alignment,
            margintop: 1.5,
            gridwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        button: [
          {
            text: 'Back',
            fontcolor: white.main,
            backgroundcolor: black.main,
            variant: 'contained' as const,
            width: '100%',
            fontvariant:
              'merriparagraph' as keyof TypographyPropsVariantOverrides,
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'step1Actions',
              alignment: 'right' as Alignment,
              columnwidth: '50%',
              marginright: 1,
              animation: 'none' as Animation,
            },
            onClick: handleBack,
            formname: 'step1form',
            name: 'back',
          },
          {
            text: 'Continue',
            fontcolor: white.main,
            backgroundcolor: black.main,
            variant: 'contained' as const,
            width: '100%',
            fontvariant:
              'merriparagraph' as keyof TypographyPropsVariantOverrides,
            columnconfig: {
              row: 1,
              column: 2,
              gridname: 'step1Actions',
              alignment: 'left' as Alignment,
              columnwidth: '50%',
              marginleft: 1,
              animation: 'none' as Animation,
            },
            onClick: handleSubmit,
            formname: 'step1form',
            name: 'continue',
          },
        ],
      },
    ],
  }

  return (
    <Dialog open maxWidth="xs" fullWidth>
      <Box component="form" sx={formContainerStyle}>
        <ContentSection grids={contentSectionProps.grids} />
      </Box>
    </Dialog>
  )
}
