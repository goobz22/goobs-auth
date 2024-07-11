// File: AuthSteps/TextMessageVerificationStep.tsx
import React from 'react'
import { Box } from '@mui/material'
import { ContentSection, ContentSectionProps } from 'goobs-frontend'

interface TextMessageVerificationStepProps {
  onVerify: () => void
  onResend: () => void
  isValid: boolean
}

const TextMessageVerificationStep: React.FC<
  TextMessageVerificationStepProps
> = ({ onVerify, onResend, isValid }) => {
  const confirmationCodeInput: ContentSectionProps['grids'][number]['confirmationcodeinput'] =
    {
      identifier: 'verificationCode',
      isValid: isValid,
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
        marginbottom: 1,
      },
      'aria-label': 'Enter SMS verification code',
      'aria-required': true,
      'aria-invalid': !isValid,
    }

  const buttonProps: ContentSectionProps['grids'][number]['button'] = [
    {
      text: 'Verify Phone',
      fontcolor: 'white',
      variant: 'contained',
      backgroundcolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 2,
        margintop: 1,
        alignment: 'center',
        columnwidth: '48%',
      },
      onClick: onVerify,
      formname: 'textMessageVerificationForm',
      'aria-label': 'Verify phone number',
    },
    {
      text: 'Resend SMS',
      fontcolor: 'black',
      variant: 'outlined',
      outlinecolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 1,
        margintop: 1,
        alignment: 'center',
        columnwidth: '48%',
      },
      onClick: onResend,
      formname: 'textMessageVerificationForm',
      'aria-label': 'Resend SMS verification code',
    },
  ]

  return (
    <Box>
      <ContentSection
        grids={[
          {
            grid: {
              gridconfig: {
                alignment: 'left',
                gridwidth: '100%',
              },
            },
            confirmationcodeinput: confirmationCodeInput,
          },
          {
            grid: {
              gridconfig: {
                alignment: 'center',
                gridwidth: '100%',
              },
            },
            button: buttonProps,
          },
        ]}
      />
    </Box>
  )
}

export default TextMessageVerificationStep
