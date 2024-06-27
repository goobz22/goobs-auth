'use client'

import React, { useState, useCallback } from 'react'
import { Box, Dialog } from '@mui/material'
import { registrationServerAction } from './../../../../actions/server/user/registration/action'
import { useRouter } from 'next/navigation'
import {
  ContentSection,
  formContainerStyle,
  Alignment,
  black,
  white,
  marine,
} from 'goobs-repo'

interface RegistrationStep0Props {
  initialEmail: string
  registrationToken?: string
}

interface HelperFooterMessage {
  status?: 'error' | 'success'
  statusMessage?: string
  spreadMessage?: string
  spreadMessagePriority?: number
  formname?: string
}

export default function RegistrationSetup({
  initialEmail,
  registrationToken,
}: RegistrationStep0Props) {
  const router = useRouter()
  const [email, setEmail] = useState(initialEmail)
  const [helperFooters, setHelperFooters] = useState<{
    email?: HelperFooterMessage
    password?: HelperFooterMessage
    verifyPassword?: HelperFooterMessage
  }>({})

  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEmail(event.target.value)
    },
    []
  )

  const handleServerActionValidation = useCallback(
    async (action: string, formData: FormData) => {
      if (!registrationToken) {
        console.error('Registration token is missing')
        return {
          status: 'error',
          spreadMessage: 'Registration token is missing. Please try again.',
          formname: 'step0form',
        } as HelperFooterMessage
      }
      const result = await registrationServerAction(
        action,
        formData,
        registrationToken
      )
      setHelperFooters(prev => ({
        ...prev,
        [action.replace('ErrorCreation', '')]: result,
      }))
      return result
    },
    [registrationToken]
  )

  const handleSubmit = async () => {
    if (!registrationToken) {
      console.error('Cannot proceed without registration token')
      setHelperFooters({
        email: {
          status: 'error',
          spreadMessage: 'Registration token is missing. Please try again.',
          formname: 'step0form',
        },
      })
      return
    }

    const formData = new FormData()
    formData.append('email', email)

    const emailResult = await handleServerActionValidation(
      'emailErrorCreation',
      formData
    )
    const passwordResult = await handleServerActionValidation(
      'passwordErrorCreation',
      formData
    )
    const verifyPasswordResult = await handleServerActionValidation(
      'verifyPasswordErrorCreation',
      formData
    )

    const hasErrors = [emailResult, passwordResult, verifyPasswordResult].some(
      result => result?.status === 'error' && result?.formname === 'step0form'
    )

    if (hasErrors) {
      console.log('Form has errors. Cannot proceed to the next step.')
      return
    }

    console.log(`Advancing to next step from current step.`)
    router.push('/auth/registration/accountinfo')
  }

  const contentSectionPropsStep0 = {
    grids: [
      {
        grid: {
          gridconfig: {
            gridname: 'registrationForm',
            alignment: 'left' as Alignment,
            gridwidth: '100%',
          },
        },
        typography: [
          {
            fontcolor: black.main,
            text: 'Registration',
            fontvariant: 'merrih3' as const,
            columnconfig: {
              row: 1,
              column: 1,
              marginbottom: 1,
              gridname: 'registrationForm',
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
              gridname: 'registrationForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            fontvariant: 'merrih4' as const,
            text: 'Create your account to get started',
            columnconfig: {
              row: 3,
              column: 1,
              gridname: 'registrationForm',
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
            value: email,
            onChange: handleEmailChange,
            formname: 'step0form',
            columnconfig: {
              row: 4,
              column: 1,
              gridname: 'registrationForm',
              alignment: 'left' as Alignment,
              marginbottom: 0.5,
            },
            serverActionValidation: (formData: FormData) =>
              handleServerActionValidation('emailErrorCreation', formData),
            helperfooter: helperFooters.email,
          },
          {
            label: 'Password',
            outlinecolor: black.main,
            componentvariant: 'password' as const,
            name: 'password',
            formname: 'step0form',
            columnconfig: {
              row: 5,
              column: 1,
              marginbottom: 0.5,
              gridname: 'registrationForm',
              alignment: 'left' as Alignment,
            },
            serverActionValidation: (formData: FormData) =>
              handleServerActionValidation('passwordErrorCreation', formData),
            helperfooter: helperFooters.password,
          },
          {
            label: 'Verify Password',
            outlinecolor: black.main,
            componentvariant: 'password' as const,
            name: 'verifyPassword',
            formname: 'step0form',
            columnconfig: {
              row: 6,
              column: 1,
              marginBottom: 1,
              gridname: 'registrationForm',
              alignment: 'left' as Alignment,
            },
            serverActionValidation: (formData: FormData) =>
              handleServerActionValidation(
                'verifyPasswordErrorCreation',
                formData
              ),
            helperfooter: helperFooters.verifyPassword,
          },
        ],
      },
      {
        grid: {
          gridconfig: {
            gridname: 'registrationActions',
            alignment: 'center' as Alignment,
            gridwidth: '100%',
          },
        },
        button: {
          text: 'Start signup',
          fontcolor: white.main,
          variant: 'contained' as const,
          backgroundcolor: black.main,
          width: '100px',
          fontvariant: 'merriparagraph' as const,
          columnconfig: {
            row: 1,
            column: 2,
            margintop: 1,
            gridname: 'registrationActions',
            alignment: 'center' as Alignment,
            columnwidth: '33.3%',
          },
          onClick: handleSubmit,
          formname: 'step0form',
          name: 'startsignup',
        },
        link: [
          {
            link: '/auth/login',
            text: 'Login instead',
            fontcolor: marine.main,
            columnconfig: {
              row: 1,
              column: 1,
              gridname: 'registrationActions',
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
              gridname: 'registrationActions',
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
      <Box component="form" sx={formContainerStyle}>
        <ContentSection grids={contentSectionPropsStep0.grids} />
      </Box>
    </Dialog>
  )
}
