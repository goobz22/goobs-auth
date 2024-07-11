// File: AuthSteps/AccountInfoStep.tsx
import React from 'react'
import { Box } from '@mui/material'
import { ContentSection, ContentSectionProps } from 'goobs-frontend'

interface AccountInfoStepProps {
  onSubmit: () => void
}

const AccountInfoStep: React.FC<AccountInfoStepProps> = ({ onSubmit }) => {
  const styledComponent: ContentSectionProps['grids'][number]['styledcomponent'] =
    [
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
      },
    ]

  const buttonProps: ContentSectionProps['grids'][number]['button'] = [
    {
      text: 'Submit',
      fontcolor: 'white',
      variant: 'contained',
      backgroundcolor: 'black',
      width: '100%',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 1,
        margintop: 1,
        alignment: 'center',
        columnwidth: '100%',
      },
      onClick: onSubmit,
      formname: 'accountInfoForm',
      'aria-label': 'Submit account information',
    },
  ]

  return (
    <Box
      component="form"
      onSubmit={e => {
        e.preventDefault()
        onSubmit()
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
  )
}

export default AccountInfoStep
