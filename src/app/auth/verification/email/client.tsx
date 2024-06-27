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
  black,
  white,
  marine,
} from 'goobs-repo'

interface EmailVerificationProps {
  email: string
}

export default function EmailVerification({ email }: EmailVerificationProps) {
  const router = useRouter()

  const handleSubmit = async (verificationCode: string) => {
    const formData = new FormData()
    formData.append('verificationCode', verificationCode)

    const result = await receiveVerificationEmail(formData)

    if (result?.status === 'success') {
      router.push('/dashboard')
    }
  }

  const handleResendEmail = async () => {
    try {
      await sendVerificationEmail({ to: email })
      console.log('Verification email resent successfully')
    } catch (error) {
      console.error('Error resending verification email:', error)
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
            gridname: 'emailVerificationForm',
            alignment: 'left' as Alignment,
            gridwidth: '100%',
          },
        },
        typography: [
          {
            fontcolor: black.main,
            text: 'Email Verification',
            fontvariant: 'merrih3' as const,
            columnconfig: {
              row: 1,
              column: 1,
              marginbottom: 1,
              gridname: 'emailVerificationForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            text: 'Secure and verify your email',
            fontvariant: 'merrih4' as const,
            columnconfig: {
              row: 2,
              column: 1,
              marginbottom: 1,
              gridname: 'emailVerificationForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            fontvariant: 'merrih4' as const,
            text: `Email Verification for ${email}`,
            columnconfig: {
              row: 3,
              column: 1,
              gridname: 'emailVerificationForm',
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
              gridname: 'emailVerificationForm',
              alignment: 'left' as Alignment,
              marginbottom: 1,
            },
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'emailVerificationActions',
            alignment: 'center' as Alignment,
            gridwidth: '100%',
          },
        },
        button: [
          {
            text: 'Resend Email',
            fontcolor: white.main,
            variant: 'contained' as const,
            backgroundcolor: black.main,
            width: '100px',
            fontvariant: 'merriparagraph' as const,
            columnconfig: {
              row: 1,
              column: 1,
              margintop: 1,
              gridname: 'emailVerificationActions',
              alignment: 'center' as Alignment,
              columnwidth: '33.3%',
            },
            onClick: handleResendEmail,
          },
          {
            text: 'Verify Email',
            fontcolor: white.main,
            variant: 'contained' as const,
            backgroundcolor: black.main,
            width: '100px',
            fontvariant: 'merriparagraph' as const,
            columnconfig: {
              row: 1,
              column: 2,
              margintop: 1,
              gridname: 'emailVerificationActions',
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
              gridname: 'emailVerificationActions',
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
            gridname: 'emailVerificationInfo',
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
            text: 'Please wait a minute and if you still have not received the verification email then click the resend button. If you resend and still do not receive the email go back and make sure you used the correct email address.',
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'emailVerificationInfo',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
          {
            fontcolor: black.main,
            fontvariant: 'merrih6' as const,
            text: 'After email verification, proceed with the next steps.',
            columnconfig: {
              row: 2,
              column: 1,
              gridname: 'emailVerificationInfo',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'emailVerificationLinks',
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
              gridname: 'emailVerificationLinks',
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
