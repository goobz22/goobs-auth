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
  Animation,
  black,
  white,
  woad,
  TypographyPropsVariantOverrides,
} from 'goobs-repo'

interface PhoneNumberVerificationProps {
  phoneNumber: string
  registrationToken: string
  onSubmitRoute: string
  onBackRoute: string
}

export default function PhoneNumberVerification({
  phoneNumber,
  onSubmitRoute,
  onBackRoute,
}: PhoneNumberVerificationProps) {
  const router = useRouter()

  const handleSubmit = async (verificationCode: string) => {
    try {
      const isValid = await verifyUser(phoneNumber, verificationCode)
      if (isValid) {
        console.log('Phone number verification successful')
        router.push(onSubmitRoute)
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
    router.push(onBackRoute)
  }

  const contentSectionPropsStep3 = {
    grids: [
      {
        grid: {
          gridconfig: {
            gridname: 'phoneVerification',
            alignment: 'left' as Alignment,
            marginbottom: 2,
            gridwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        bodytitle: {
          fontcolor: black.main,
          fontvariant: 'merrih4' as keyof TypographyPropsVariantOverrides,
          text: 'Verify your phone number',
          columnconfig: {
            row: 1,
            column: 1,
            gridname: 'phoneVerification',
            alignment: 'left' as Alignment,
            columnwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        paragraph: {
          fontcolor: black.main,
          fontvariant: 'merrih6' as keyof TypographyPropsVariantOverrides,
          text: 'Text Message Verification',
          columnconfig: {
            row: 2,
            column: 1,
            gridname: 'phoneVerification',
            alignment: 'left' as Alignment,
            columnwidth: '100%',
            marginbottom: 0.5,
            animation: 'none' as Animation,
          },
        },
      },
      {
        grid: {
          gridconfig: {
            gridname: 'confirmationCode',
            alignment: 'left' as Alignment,
            margintop: 2,
            marginbottom: 2,
            gridwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        confirmationcodeinput: {
          columnconfig: {
            row: 1,
            column: 1,
            gridname: 'confirmationCode',
            alignment: 'left' as Alignment,
            columnwidth: '100%',
            animation: 'none' as Animation,
          },
          isValid: false,
        },
      },
      {
        grid: {
          gridconfig: {
            gridname: 'phoneVerificationActions',
            alignment: 'left' as Alignment,
            margintop: 2,
            gridwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        button: [
          {
            text: 'Resend Text',
            fontcolor: black.main,
            variant: 'contained' as const,
            backgroundcolor: woad.main,
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'phoneVerificationActions',
              alignment: 'center' as Alignment,
              columnwidth: '50%',
              animation: 'none' as Animation,
            },
            formname: 'phoneverificationform',
            name: 'resendText',
            onClick: handleResend,
          },
          {
            text: 'Verify Text',
            variant: 'contained' as const,
            fontcolor: black.main,
            backgroundcolor: woad.main,
            columnconfig: {
              row: 1,
              column: 2,
              gridname: 'phoneVerificationActions',
              alignment: 'center' as Alignment,
              columnwidth: '50%',
              animation: 'none' as Animation,
            },
            formname: 'phoneverificationform',
            name: 'verifyText',
            onClick: async () => {
              const verificationCode = document.querySelector<HTMLInputElement>(
                'input[name="verificationCode"]'
              )?.value
              if (verificationCode) {
                await handleSubmit(verificationCode)
              }
            },
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
            animation: 'none' as Animation,
          },
        },
        paragraph: [
          {
            fontcolor: black.main,
            fontvariant:
              'merriparagraph' as keyof TypographyPropsVariantOverrides,
            text: 'Please wait a minute and if you still have not received the verification text then click the resend button. If you resend and still do not receive the text please go back and confirm your phone number.',
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'phoneVerificationInfo',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              animation: 'none' as Animation,
            },
          },
          {
            fontcolor: black.main,
            fontvariant:
              'merriparagraph' as keyof TypographyPropsVariantOverrides,
            text: 'After phone number verification, proceed with the next steps.',
            columnconfig: {
              row: 2,
              column: 1,
              gridname: 'phoneVerificationInfo',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              animation: 'none' as Animation,
            },
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'step3Actions',
            alignment: 'left' as Alignment,
            margintop: 2,
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
              gridname: 'step3Actions',
              alignment: 'right' as Alignment,
              columnwidth: '50%',
              marginright: 1,
              animation: 'none' as Animation,
            },
            onClick: handleBack,
          },
        ],
      },
    ],
  }

  return (
    <Dialog open maxWidth="xs" fullWidth>
      <Box component="form" sx={formContainerStyle}>
        <ContentSection grids={contentSectionPropsStep3.grids} />
      </Box>
    </Dialog>
  )
}
