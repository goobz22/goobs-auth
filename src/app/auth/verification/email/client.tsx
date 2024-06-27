'use client'

import React from 'react'
import { Box, Dialog } from '@mui/material'
import { useRouter } from 'next/navigation'
import { receiveVerificationEmail } from './../../../../actions/server/auth/verification/receiveEmail'
import { sendVerificationEmail } from './../../../../actions/server/auth/verification/sendEmail'
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

interface EmailVerificationProps {
  email: string
  registrationToken: string
  onSubmitRoute: string
  onBackRoute: string
}

export default function EmailVerification({
  email,
  registrationToken,
  onSubmitRoute,
  onBackRoute,
}: EmailVerificationProps) {
  const router = useRouter()

  const handleSubmit = async (verificationCode: string) => {
    const formData = new FormData()
    formData.append('verificationCode', verificationCode)

    const result = await receiveVerificationEmail(formData, registrationToken)

    if (result?.status === 'success') {
      router.push(onSubmitRoute)
    }
  }

  const handleResendEmail = async () => {
    try {
      await sendVerificationEmail({ to: email, registrationToken })
      console.log('Verification email resent successfully')
    } catch (error) {
      console.error('Error resending verification email:', error)
    }
  }

  const handleBack = () => {
    router.push(onBackRoute)
  }

  const contentSectionPropsStep2 = {
    grids: [
      {
        grid: {
          gridconfig: {
            gridname: 'emailVerification',
            alignment: 'left' as Alignment,
            marginbottom: 2,
            gridwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        bodytitle: {
          fontcolor: black.main,
          fontvariant: 'merrih4' as keyof TypographyPropsVariantOverrides,
          text: 'Secure and verify your email',
          columnconfig: {
            row: 1,
            column: 1,
            gridname: 'emailVerification',
            alignment: 'left' as Alignment,
            columnwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        paragraph: {
          fontcolor: black.main,
          fontvariant: 'merrih6' as keyof TypographyPropsVariantOverrides,
          text: `Email Verification for ${email}`,
          columnconfig: {
            row: 2,
            column: 1,
            gridname: 'emailVerification',
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
            gridname: 'emailVerificationActions',
            alignment: 'left' as Alignment,
            margintop: 1,
            marginbottom: 1,
            gridwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        button: [
          {
            text: 'Resend Email',
            fontcolor: black.main,
            variant: 'contained' as const,
            backgroundcolor: woad.main,
            fontvariant:
              'merriparagraph' as keyof TypographyPropsVariantOverrides,
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'emailVerificationActions',
              alignment: 'center' as Alignment,
              columnwidth: '50%',
              animation: 'none' as Animation,
            },
            formname: 'emailverificationform',
            name: 'resendEmail',
            onClick: handleResendEmail,
          },
          {
            text: 'Verify Email',
            variant: 'contained' as const,
            fontcolor: black.main,
            backgroundcolor: woad.main,
            columnconfig: {
              row: 1,
              column: 2,
              gridname: 'emailVerificationActions',
              alignment: 'center' as Alignment,
              columnwidth: '50%',
              animation: 'none' as Animation,
            },
            formname: 'emailverificationform',
            name: 'verifyEmail',
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
            gridname: 'emailVerificationInfo',
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
            text: 'Please wait a minute and if you still have not received the verification email then click the resend button. If you resend and still do not receive the email go back and make sure you used the correct email address.',
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'emailVerificationInfo',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              animation: 'none' as Animation,
            },
          },
          {
            fontcolor: black.main,
            text: 'After email verification, proceed with the next steps.',
            columnconfig: {
              row: 2,
              column: 1,
              gridname: 'emailVerificationInfo',
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
            gridname: 'step2Actions',
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
              gridname: 'step2Actions',
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
        <ContentSection grids={contentSectionPropsStep2.grids} />
      </Box>
    </Dialog>
  )
}
