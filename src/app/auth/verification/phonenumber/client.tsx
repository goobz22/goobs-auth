'use client'

import React from 'react'
import { Box, Dialog } from '@mui/material'
import { useRouter } from 'next/navigation'
import sendSMS from './../../../../actions/server/twilio/send'
import verifyUser from './../../../../actions/server/twilio/verify'
import {
  ContentSection,
  formContainerStyle,
  Alignment,
  black,
  white,
  marine,
} from 'goobs-repo'

interface PhoneNumberVerificationProps {
  phoneNumber: string
}

export default function PhoneNumberVerification({
  phoneNumber,
}: PhoneNumberVerificationProps) {
  const router = useRouter()

  const handleSubmit = async (verificationCode: string) => {
    try {
      const isValid = await verifyUser(phoneNumber, verificationCode)
      if (isValid) {
        console.log('Phone number verification successful')
        router.push('/dashboard')
      } else {
        console.error('Phone number verification failed')
      }
    } catch (error) {
      console.error('Error verifying phone number:', error)
    }
  }

  const handleResend = async () => {
    try {
      await sendSMS(phoneNumber)
      console.log('Verification code resent successfully')
    } catch (error) {
      console.error('Error resending verification code:', error)
    }
  }

  const handleBack = () => {
    router.push('/auth/login')
  }

  const contentSectionProps = {
    grids: [
      {
        grid: {
          gridconfig: {
            gridname: 'phoneVerificationForm',
            alignment: 'left' as Alignment,
            gridwidth: '100%',
          },
        },
        typography: [
          {
            fontcolor: black.main,
            text: 'Phone Verification',
            fontvariant: 'merrih3' as const,
            columnconfig: {
              row: 1,
              column: 1,
              marginbottom: 1,
              gridname: 'phoneVerificationForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            text: 'Verify your phone number',
            fontvariant: 'merrih4' as const,
            columnconfig: {
              row: 2,
              column: 1,
              marginbottom: 1,
              gridname: 'phoneVerificationForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            fontvariant: 'merrih4' as const,
            text: `Text Message Verification for ${phoneNumber}`,
            columnconfig: {
              row: 3,
              column: 1,
              gridname: 'phoneVerificationForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
        ],
        styledcomponent: [
          {
            label: 'Verification Code',
            outlinecolor: black.main,
            componentvariant: 'textfield' as const,
            shrunklabellocation: 'onnotch' as const,
            name: 'verificationCode',
            columnconfig: {
              row: 4,
              column: 1,
              gridname: 'phoneVerificationForm',
              alignment: 'left' as Alignment,
              marginbottom: 1,
            },
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'phoneVerificationActions',
            alignment: 'center' as Alignment,
            gridwidth: '100%',
          },
        },
        button: [
          {
            text: 'Resend Text',
            fontcolor: white.main,
            variant: 'contained' as const,
            backgroundcolor: black.main,
            width: '100px',
            fontvariant: 'merriparagraph' as const,
            columnconfig: {
              row: 1,
              column: 1,
              margintop: 1,
              gridname: 'phoneVerificationActions',
              alignment: 'center' as Alignment,
              columnwidth: '33.3%',
            },
            onClick: handleResend,
          },
          {
            text: 'Verify Text',
            fontcolor: white.main,
            variant: 'contained' as const,
            backgroundcolor: black.main,
            width: '100px',
            fontvariant: 'merriparagraph' as const,
            columnconfig: {
              row: 1,
              column: 2,
              margintop: 1,
              gridname: 'phoneVerificationActions',
              alignment: 'center' as Alignment,
              columnwidth: '33.3%',
            },
            onClick: async () => {
              const verificationCode = document.querySelector<HTMLInputElement>(
                'input[name="verificationCode"]'
              )?.value
              if (verificationCode) {
                await handleSubmit(verificationCode)
              }
            },
          },
          {
            text: 'Back',
            fontcolor: white.main,
            variant: 'contained' as const,
            backgroundcolor: black.main,
            width: '100px',
            fontvariant: 'merriparagraph' as const,
            columnconfig: {
              row: 1,
              column: 3,
              margintop: 1,
              gridname: 'phoneVerificationActions',
              alignment: 'center' as Alignment,
              columnwidth: '33.3%',
            },
            onClick: handleBack,
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'phoneVerificationInfo',
            alignment: 'left' as Alignment,
            margintop: 2,
            marginbottom: 2,
            gridwidth: '100%',
          },
        },
        typography: [
          {
            fontcolor: black.main,
            fontvariant: 'merrih6' as const,
            text: 'Please wait a minute and if you still have not received the verification text then click the resend button. If you resend and still do not receive the text please go back and confirm your phone number.',
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'phoneVerificationInfo',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
          {
            fontcolor: black.main,
            fontvariant: 'merrih6' as const,
            text: 'After phone number verification, proceed with the next steps.',
            columnconfig: {
              row: 2,
              column: 1,
              gridname: 'phoneVerificationInfo',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'phoneVerificationLinks',
            alignment: 'center' as Alignment,
            gridwidth: '100%',
          },
        },
        link: [
          {
            link: '/auth/login',
            text: 'Back to Login',
            fontcolor: marine.main,
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'phoneVerificationLinks',
              alignment: 'center' as Alignment,
              columnwidth: '100%',
              margintop: 1,
            },
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
