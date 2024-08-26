// File: AuthSteps/VerificationStep.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { PopupForm } from 'goobs-frontend';

interface VerificationStepProps {
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  onContinue: () => void;
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  onVerify,
  onResend,
  onBack,
  onContinue,
}) => {
  const [isValid, setIsValid] = useState(true);

  const handleVerify = () => {
    setIsValid((prev) => !prev);
    onVerify();
  };

  const confirmationCodeInput = {
    identifier: 'verificationCode',
    isValid: isValid,
    columnconfig: {
      row: 1,
      column: 1,
      alignment: 'left' as const,
      columnwidth: '100%',
      marginbottom: 1,
    },
    'aria-label': 'Enter SMS verification code',
    'aria-required': true,
    'aria-invalid': !isValid,
  };

  const verifyResendButtonProps = [
    {
      text: 'Verify Phone',
      fontcolor: 'white',
      variant: 'contained' as const,
      backgroundcolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph' as const,
      columnconfig: {
        row: 1,
        column: 2,
        margintop: 1,
        alignment: 'center' as const,
        columnwidth: '48%',
      },
      onClick: handleVerify,
      'aria-label': 'Verify phone number',
    },
    {
      text: 'Resend SMS',
      fontcolor: 'white',
      variant: 'outlined' as const,
      backgroundcolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph' as const,
      columnconfig: {
        row: 1,
        column: 1,
        marginright: 1,
        margintop: 1,
        alignment: 'center' as const,
        columnwidth: '48%',
      },
      onClick: onResend,
      'aria-label': 'Resend SMS verification code',
    },
  ];

  const infoTypographyProps = [
    {
      text: 'Please wait a minute and if you still have not received the verification text then click the resend button. If you resend and still do not receive the text please go back and confirm your phone number.',
      fontvariant: 'merriparagraph' as const,
      fontcolor: 'black',
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left' as const,
        marginbottom: 1,
        columnwidth: '100%',
      },
    },
    {
      text: 'After phone number verification, proceed with the next steps.',
      fontvariant: 'merriparagraph' as const,
      fontcolor: 'black',
      columnconfig: {
        row: 2,
        column: 1,
        margintop: 1,
        alignment: 'left' as const,
        columnwidth: '100%',
      },
    },
  ];

  const backContinueButtonProps = [
    {
      text: 'Back',
      fontcolor: 'white',
      variant: 'outlined' as const,
      backgroundcolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph' as const,
      columnconfig: {
        row: 1,
        column: 1,
        marginright: 1,
        alignment: 'center' as const,
        columnwidth: '48%',
      },
      onClick: onBack,
      'aria-label': 'Go back',
    },
    {
      text: 'Continue',
      fontcolor: 'white',
      variant: 'contained' as const,
      backgroundcolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph' as const,
      columnconfig: {
        row: 1,
        column: 2,
        alignment: 'center' as const,
        columnwidth: '48%',
      },
      onClick: onContinue,
      'aria-label': 'Continue to next step',
    },
  ];

  return (
    <Box>
      <PopupForm
        title="Verify your phone number"
        description="Text Message Verification"
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
        popupType="modal"
        width={450}
      />
    </Box>
  );
};

export default VerificationStep;
