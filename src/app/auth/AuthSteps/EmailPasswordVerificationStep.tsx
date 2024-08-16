// File: AuthSteps/EmailPasswordVerificationStep.tsx
import React from 'react';
import { Box } from '@mui/material';
import { ContentSection, ContentSectionProps } from 'goobs-frontend';

interface EmailPasswordVerificationStepProps {
  onSubmit: () => void;
  isRegistration: boolean;
}

const EmailPasswordVerificationStep: React.FC<EmailPasswordVerificationStepProps> = ({
  onSubmit,
  isRegistration,
}) => {
  const styledComponent: ContentSectionProps['grids'][number]['styledcomponent'] = [
    {
      name: 'email',
      label: 'Email Address',
      componentvariant: 'textfield',
      outlinecolor: 'black',
      shrunklabellocation: 'onnotch',
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
        marginbottom: 0.5,
      },
      formname: 'emailPasswordForm',
      'aria-label': 'Enter your email address',
      required: true,
    },
    {
      name: 'verifyPassword',
      label: 'Password',
      componentvariant: 'password',
      outlinecolor: 'black',
      shrunklabellocation: 'onnotch',
      columnconfig: {
        row: 2,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
        marginbottom: 0.5,
      },
      formname: 'emailPasswordForm',
      'aria-label': 'Enter your password',
      required: true,
    },
    ...(isRegistration
      ? [
          {
            name: 'confirmPassword',
            label: 'Confirm Password',
            componentvariant: 'password' as const,
            outlinecolor: 'black',
            shrunklabellocation: 'onnotch' as const,
            columnconfig: {
              row: 3,
              column: 1,
              alignment: 'left' as const,
              columnwidth: '100%',
              marginbottom: 0.5,
            },
            formname: 'emailPasswordForm',
            'aria-label': 'Confirm your password',
            required: true,
          },
        ]
      : []),
  ];

  const buttonProps: ContentSectionProps['grids'][number]['button'] = [
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
        margintop: 1,
        alignment: 'center',
        columnwidth: '33.3%',
      },
      onClick: onSubmit,
      formname: 'emailPasswordForm',
      'aria-label': 'Continue',
    },
  ];
  const linkProps: ContentSectionProps['grids'][number]['link'] = [
    {
      link: '/auth',
      text: 'Login instead',
      fontcolor: 'marine.main',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left',
        columnwidth: '33%',
        margintop: 1,
      },
    },
    {
      link: '/auth?mode=forgotPassword',
      text: 'Forgot password',
      fontcolor: 'marine.main',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 3,
        alignment: 'right',
        columnwidth: '33%',
        margintop: 1,
      },
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
            styledcomponent: styledComponent,
          },
          {
            grid: {
              gridconfig: {
                alignment: 'center',
                gridwidth: '100%',
              },
            },
            button: buttonProps,
            link: linkProps,
          },
        ]}
      />
    </Box>
  );
};

export default EmailPasswordVerificationStep;
