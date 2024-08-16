// File: AuthSteps/EmailVerificationStep.tsx
import React from 'react';
import { Box } from '@mui/material';
import { ContentSection, ContentSectionProps } from 'goobs-frontend';

interface EmailVerificationStepProps {
  onVerify: () => void;
  onResend: () => void;
  isValid: boolean;
  onBack: () => void;
  onContinue: () => void;
  email: string;
}

const EmailVerificationStep: React.FC<EmailVerificationStepProps> = ({
  onVerify,
  onResend,
  isValid,
  onBack,
  onContinue,
  email,
}) => {
  const confirmationCodeInput: ContentSectionProps['grids'][number]['confirmationcodeinput'] = {
    identifier: 'verificationCode',
    isValid: isValid,
    columnconfig: {
      row: 1,
      column: 1,
      alignment: 'left',
      columnwidth: '100%',
      marginbottom: 1,
    },
    'aria-label': 'Enter verification code',
    'aria-required': true,
    'aria-invalid': !isValid,
  };

  const verifyResendButtonProps: ContentSectionProps['grids'][number]['button'] = [
    {
      text: 'Verify Email',
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
      formname: 'emailVerificationForm',
      'aria-label': 'Verify email',
    },
    {
      text: 'Resend Code',
      fontcolor: 'black',
      variant: 'outlined',
      outlinecolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 1,
        marginright: 1,
        margintop: 1,
        alignment: 'center',
        columnwidth: '48%',
      },
      onClick: onResend,
      formname: 'emailVerificationForm',
      'aria-label': 'Resend verification code',
    },
  ];

  const headerTypographyProps: ContentSectionProps['grids'][number]['typography'] = [
    {
      text: 'Secure and verify your email',
      fontvariant: 'merrih4',
      fontcolor: 'black',
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
      },
    },
    {
      text: `Email Verification for ${email}`,
      fontvariant: 'merrih6',
      fontcolor: 'black',
      columnconfig: {
        row: 2,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
        marginbottom: 0.5,
      },
    },
  ];

  const infoTypographyProps: ContentSectionProps['grids'][number]['typography'] = [
    {
      text: 'Please wait a minute and if you still have not received the verification email then click the resend button. If you resend and still do not receive the email go back and make sure you used the correct email address.',
      fontvariant: 'merriparagraph',
      fontcolor: 'black',
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
      },
    },
    {
      text: 'After email verification, proceed with the next steps.',
      fontvariant: 'merriparagraph',
      fontcolor: 'black',
      columnconfig: {
        row: 2,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
      },
    },
  ];

  const backContinueButtonProps: ContentSectionProps['grids'][number]['button'] = [
    {
      text: 'Back',
      fontcolor: 'black',
      variant: 'outlined',
      outlinecolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 1,
        marginright: 1,
        alignment: 'center',
        columnwidth: '48%',
      },
      onClick: onBack,
      formname: 'emailVerificationForm',
      'aria-label': 'Go back',
    },
    {
      text: 'Continue',
      fontcolor: 'white',
      variant: 'contained',
      backgroundcolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 2,
        alignment: 'center',
        columnwidth: '48%',
      },
      onClick: onContinue,
      formname: 'emailVerificationForm',
      'aria-label': 'Continue to next step',
    },
  ];

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
            typography: headerTypographyProps,
          },
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
            button: verifyResendButtonProps,
          },
          {
            grid: {
              gridconfig: {
                alignment: 'left',
                gridwidth: '100%',
                margintop: 1,
                marginbottom: 1,
              },
            },
            typography: infoTypographyProps,
          },
          {
            grid: {
              gridconfig: {
                alignment: 'center',
                gridwidth: '100%',
              },
            },
            button: backContinueButtonProps,
          },
        ]}
      />
    </Box>
  );
};

export default EmailVerificationStep;
