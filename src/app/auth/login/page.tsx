'use client'

import { Box, Dialog } from '@mui/material'
import loginAction from './../../../actions/server/user/login/action'
import { useState } from 'react'
import React from 'react'
import {
  ContentSection,
  formContainerStyle,
  Alignment,
  black,
  white,
  marine,
} from 'goobs-repo'

export default function Login() {
  const [, setStep] = useState(0)

  const forwardStep = () => {
    console.log(`Advancing to next step from current step.`)
    setStep(prevStep => prevStep + 1)
  }

  const contentSectionProps = {
    grids: [
      {
        grid: {
          gridconfig: {
            gridname: 'loginForm',
            alignment: 'left' as Alignment,
            gridwidth: '100%',
          },
        },
        typography: [
          {
            fontcolor: black.main,
            text: 'Login',
            fontvariant: 'merrih3' as const,
            columnconfig: {
              row: 1,
              column: 1,
              marginbottom: 1,
              gridname: 'loginForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            text: 'Welcome to Kaizen',
            fontvariant: 'merrih4' as const,
            columnconfig: {
              row: 2,
              column: 1,
              marginbottom: 1,
              gridname: 'loginForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            fontvariant: 'merrih4' as const,
            text: 'Login to continue to the application',
            columnconfig: {
              row: 3,
              column: 1,
              gridname: 'loginForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
        ],
        styledcomponent: [
          {
            label: 'Email Address',
            outlinecolor: black.main,
            componentvariant: 'textfield' as const,
            shrunklabellocation: 'onnotch' as const,
            name: 'email',
            columnconfig: {
              row: 4,
              column: 1,
              gridname: 'loginForm',
              alignment: 'left' as Alignment,
              marginbottom: 1,
            },
          },
          {
            label: 'Password',
            outlinecolor: black.main,
            componentvariant: 'password' as const,
            name: 'password',
            columnconfig: {
              row: 5,
              column: 1,
              marginBottom: 1,
              gridname: 'loginForm',
              alignment: 'left' as Alignment,
            },
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'loginActions',
            alignment: 'center' as Alignment,
            gridwidth: '100%',
          },
        },
        button: {
          text: 'Login',
          fontcolor: white.main,
          variant: 'contained' as const,
          backgroundcolor: black.main,
          width: '100px',
          fontvariant: 'merriparagraph' as const,
          columnconfig: {
            row: 1,
            column: 2,
            margintop: 1,
            gridname: 'loginActions',
            alignment: 'center' as Alignment,
            columnwidth: '33.3%',
          },
          onClick: forwardStep,
        },
        link: [
          {
            link: '/auth/registration',
            text: 'Create account',
            fontcolor: marine.main,
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'loginActions',
              alignment: 'left' as Alignment,
              columnwidth: '33.3%',
              margintop: 1,
              marginright: 1,
            },
          },
          {
            link: '/auth/forgot-password',
            text: 'Forgot password',
            fontcolor: marine.main,
            columnconfig: {
              row: 1,
              column: 3,
              gridname: 'loginActions',
              alignment: 'right' as Alignment,
              columnwidth: '33.3%',
              margintop: 1,
              marginleft: 1,
            },
          },
        ],
      },
    ],
  }

  return (
    <Dialog open maxWidth="xs" fullWidth>
      <Box component="form" action={loginAction} sx={formContainerStyle}>
        <ContentSection grids={contentSectionProps.grids} />
      </Box>
    </Dialog>
  )
}
