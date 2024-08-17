// File: AuthSteps/VerificationStep.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ContentSection, ContentSectionProps } from 'goobs-frontend';

interface VerificationStepProps {
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  onContinue: () => void;
  verificationMethod: 'email' | 'sms';
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  onVerify,
  onResend,
  onBack,
  onContinue,
  verificationMethod,
}) => {
  const [isValid, setIsValid] = useState(true);
  const isEmail = verificationMethod === 'email';

  const handleVerify = () => {
    setIsValid((prev) => !prev);
    onVerify();
  };

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
    'aria-label': `Enter ${isEmail ? 'email' : 'SMS'} verification code`,
    'aria-required': true,
    'aria-invalid': !isValid,
  };

  const verifyResendButtonProps: ContentSectionProps['grids'][number]['button'] = [
    {
      text: `Verify ${isEmail ? 'Email' : 'Phone'}`,
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
      onClick: handleVerify,
      formname: `${verificationMethod}VerificationForm`,
      'aria-label': `Verify ${isEmail ? 'email' : 'phone number'}`,
    },
    {
      text: `Resend ${isEmail ? 'Code' : 'SMS'}`,
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
      formname: `${verificationMethod}VerificationForm`,
      'aria-label': `Resend ${isEmail ? 'email' : 'SMS'} verification code`,
    },
  ];

  const headerTypographyProps: ContentSectionProps['grids'][number]['typography'] = [
    {
      text: isEmail ? 'Secure and verify your email' : 'Verify your phone number',
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
      text: `${isEmail ? 'Email' : 'Text Message'} Verification`,
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
      text: `Please wait a minute and if you still have not received the verification ${isEmail ? 'email' : 'text'} then click the resend button. If you resend and still do not receive the ${isEmail ? 'email' : 'text'} please go back and confirm your ${isEmail ? 'email address' : 'phone number'}.`,
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
      text: `After ${isEmail ? 'email' : 'phone number'} verification, proceed with the next steps.`,
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
      formname: `${verificationMethod}VerificationForm`,
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
      formname: `${verificationMethod}VerificationForm`,
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

export default VerificationStep;
