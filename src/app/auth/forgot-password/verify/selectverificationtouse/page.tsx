'use client'

import { Box, Dialog } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import React from 'react'
import {
  ContentSection,
  formContainerStyle,
  Alignment,
  Animation,
  black,
  white,
  TypographyPropsVariantOverrides,
} from 'goobs-repo'

export default function SelectVerificationToUse() {
  const [selectedVerification, setSelectedVerification] = useState('')

  const router = useRouter()

  const handleVerificationMethodChange = (value: string) => {
    console.log('handleVerificationMethodChange called with value:', value)
    setSelectedVerification(value)
  }

  const handleContinue = (selectedVerification: string) => {
    console.log(
      'handleContinue called with selectedVerification:',
      selectedVerification
    )
    if (selectedVerification === 'email') {
      console.log('Navigating to /auth/forgot-password/verify/email')
      router.push('/auth/forgot-password/verify/email')
    } else if (selectedVerification === 'phonenumber') {
      console.log('Navigating to /auth/forgot-password/verify/phonenumber')
      router.push('/auth/forgot-password/verify/phonenumber')
    } else {
      console.log('No verification method selected')
    }
  }

  const handleBack = () => {
    console.log('handleBack called')
    router.push('/auth/forgot-password')
  }

  const contentSectionProps = {
    grids: [
      {
        grid: {
          gridconfig: {
            rows: 3,
            gridname: 'selectVerificationForm',
            alignment: 'left' as Alignment,
            gridwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        subtitle: {
          fontcolor: black.main,
          fontvariant: 'merrih3' as keyof TypographyPropsVariantOverrides,
          text: 'Select Recovery Method',
          columnconfig: {
            row: 1,
            column: 1,
            gridname: 'selectVerificationForm',
            alignment: 'left' as Alignment,
            columnwidth: '100%',
            animation: 'none' as Animation,
          },
        },
        bodytitle: {
          fontcolor: black.main,
          fontvariant: 'merrih4' as keyof TypographyPropsVariantOverrides,
          text: 'Pick email or phone recovery',
          columnconfig: {
            row: 2,
            column: 1,
            gridname: 'selectVerificationForm',
            alignment: 'left' as Alignment,
            columnwidth: '100%',
            marginbottom: 1,
            animation: 'none' as Animation,
          },
        },
        radiogroup: {
          name: 'verificationMethod',
          defaultValue: selectedVerification,
          options: [
            {
              value: 'email',
              label: 'Email Verification',
              fontColor: black.main,
              fontVariant:
                'merriparagraph' as keyof TypographyPropsVariantOverrides,
            },
            {
              value: 'phonenumber',
              label: 'Phone Number Verification',
              fontColor: black.main,
              fontVariant:
                'merriparagraph' as keyof TypographyPropsVariantOverrides,
            },
          ],
          labelFontVariant: 'merrih5' as keyof TypographyPropsVariantOverrides,
          labelFontColor: black.main,
          labelText: 'Verification Method',
          columnconfig: {
            row: 3,
            column: 1,
            gridname: 'selectVerificationForm',
            alignment: 'left' as Alignment,
            columnwidth: '100%',
            animation: 'none' as Animation,
          },
          onChange: (value: string) => {
            console.log('radiogroup onChange called with value:', value)
            handleVerificationMethodChange(value)
          },
        },
      },
      {
        grid: {
          gridconfig: {
            rows: 1,
            columns: 2,
            gridname: 'selectVerificationActions',
            alignment: 'center' as Alignment,
            gridwidth: '100%',
            margintop: 1,
            marginbottom: 0,
            marginleft: 0,
            marginright: 0,
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
              gridname: 'selectVerificationActions',
              alignment: 'right' as Alignment,
              columnwidth: '50%',
              margintop: 0,
              marginbottom: 0,
              marginright: 1,
              animation: 'none' as Animation,
            },
            onClick: handleBack,
            formname: 'selectVerificationForm',
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
              gridname: 'selectVerificationActions',
              alignment: 'left' as Alignment,
              columnwidth: '50%',
              margintop: 0,
              marginleft: 1,
              marginbottom: 0,
              marginright: 0,
              animation: 'none' as Animation,
            },
            onClick: () => {
              console.log(
                'Continue button onClick called with selectedVerification:',
                selectedVerification
              )
              handleContinue(selectedVerification)
            },
            formname: 'selectVerificationForm',
            name: 'continue',
          },
        ],
      },
    ],
  }

  return (
    <Dialog open maxWidth="xs" fullWidth>
      <Box sx={formContainerStyle}>
        <ContentSection grids={contentSectionProps.grids} />
      </Box>
    </Dialog>
  )
}
