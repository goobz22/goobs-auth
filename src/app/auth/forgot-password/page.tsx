'use client'

import { Box, Dialog } from '@mui/material'
import loginAction from './../../../actions/server/user/login/action'
import {
  Alignment,
  ContentSection,
  formContainerStyle,
  black,
  white,
  marine,
} from 'goobs-repo'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function ForgotPassword() {
  const router = useRouter()

  const handleRecoverAccount = () => {
    router.push('/auth/forgot-password/verify/selectverificationtouse')
  }

  const contentSectionProps = {
    grids: [
      {
        grid: {
          gridconfig: {
            gridname: 'forgotPasswordForm',
            alignment: 'left' as Alignment,
            gridwidth: '100%',
          },
        },
        typography: [
          {
            fontcolor: black.main,
            text: 'Reset your password',
            fontvariant: 'merrih3' as const,
            columnconfig: {
              row: 1,
              column: 1,
              marginbottom: 1,
              gridname: 'forgotPasswordForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            text: 'Lost account access?',
            fontvariant: 'merrih4' as const,
            columnconfig: {
              row: 2,
              marginbottom: 1,
              column: 1,
              gridname: 'forgotPasswordForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            fontvariant: 'merrih5' as const,
            text: 'Type in your email to start recovery',
            columnconfig: {
              row: 3,
              column: 1,
              gridname: 'forgotPasswordForm',
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
              gridname: 'forgotPasswordForm',
              alignment: 'left' as Alignment,
              marginbottom: 1,
            },
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'forgotPasswordActions',
            alignment: 'center' as Alignment,
            gridwidth: '100%',
          },
        },
        button: {
          text: 'Recover Account',
          fontcolor: white.main,
          variant: 'contained' as const,
          backgroundcolor: black.main,
          width: '150px',
          fontvariant: 'merriparagraph' as const,
          columnconfig: {
            row: 1,
            column: 2,
            margintop: 1,
            gridname: 'forgotPasswordActions',
            alignment: 'center' as Alignment,
            columnwidth: '33.3%',
          },
          onClick: handleRecoverAccount,
        },
        link: [
          {
            link: '/auth/login',
            text: 'Back to login',
            fontcolor: marine.main,
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'forgotPasswordActions',
              alignment: 'left' as Alignment,
              columnwidth: '33.3%',
              margintop: 1,
              marginright: 1,
            },
          },
          {
            link: '/auth/registration',
            text: 'Create account',
            fontcolor: marine.main,
            columnconfig: {
              row: 1,
              column: 3,
              gridname: 'forgotPasswordActions',
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
