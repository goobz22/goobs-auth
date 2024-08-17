// File: AuthSteps/AccountInfoStep.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ContentSection, ContentSectionProps } from 'goobs-frontend';

interface AccountInfoStepProps {
  onSubmit: () => void;
  onBack: () => void;
}

const AccountInfoStep: React.FC<AccountInfoStepProps> = ({ onSubmit, onBack }) => {
  const [phoneNumber] = useState('');

  const styledComponent: ContentSectionProps['grids'][number]['styledcomponent'] = [
    {
      name: 'firstName',
      label: 'First Name',
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
      formname: 'accountInfoForm',
      'aria-label': 'Enter your first name',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      componentvariant: 'textfield',
      outlinecolor: 'black',
      shrunklabellocation: 'onnotch',
      columnconfig: {
        row: 2,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
        marginbottom: 0.5,
      },
      formname: 'accountInfoForm',
      'aria-label': 'Enter your last name',
      required: true,
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      componentvariant: 'phonenumber',
      outlinecolor: 'black',
      shrunklabellocation: 'onnotch',
      columnconfig: {
        row: 3,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
        marginbottom: 0.5,
      },
      formname: 'accountInfoForm',
      'aria-label': 'Enter your phone number',
      required: true,
      value: phoneNumber,
    },
  ];

  const buttonProps: ContentSectionProps['grids'][number]['button'] = [
    {
      text: 'Back',
      fontcolor: 'black',
      variant: 'outlined',
      backgroundcolor: 'white',
      width: '100%',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 1,
        margintop: 1,
        marginright: 1,
        alignment: 'center',
        columnwidth: '48%',
      },
      onClick: onBack,
      'aria-label': 'Go back',
    },
    {
      text: 'Submit',
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
      onClick: onSubmit,
      formname: 'accountInfoForm',
      'aria-label': 'Submit account information',
    },
  ];

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
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
          },
        ]}
      />
    </Box>
  );
};

export default AccountInfoStep;
