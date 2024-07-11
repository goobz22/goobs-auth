// File: AuthSteps/EnterEmailStep.tsx
import React from 'react'
import { Box } from '@mui/material'
import { ContentSection, ContentSectionProps } from 'goobs-frontend'

interface EnterEmailStepProps {
  onSubmit: () => void
}

const EnterEmailStep: React.FC<EnterEmailStepProps> = ({ onSubmit }) => {
  const styledComponent: ContentSectionProps['grids'][number]['styledcomponent'] =
    [
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
          marginbottom: 1,
        },
        formname: 'enterEmailForm',
        'aria-label': 'Enter your email address',
        required: true,
      },
    ]

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
      formname: 'enterEmailForm',
      'aria-label': 'Continue',
    },
  ]

  const linkProps: ContentSectionProps['grids'][number]['link'] = [
    {
      link: '/auth?mode=registration',
      text: 'Create account',
      fontcolor: 'marine.main',
      fontvariant: 'merriparagraph',
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left',
        columnwidth: '33.3%',
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
        columnwidth: '33.3%',
        margintop: 1,
      },
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
            link: linkProps,
          },
        ]}
      />
    </Box>
  )
}

export default EnterEmailStep
