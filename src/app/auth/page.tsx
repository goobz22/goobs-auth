'use client'

import React, { useState, useEffect } from 'react'
import { Box, Dialog } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ContentSection,
  formContainerStyle,
  Alignment,
  black,
  white,
  marine,
} from 'goobs-repo'
import loadAuthConfig, {
  AuthConfig,
  AuthStep,
} from '../../actions/server/auth/configLoader'

// TODO: Import the necessary actions
// import { loginAction, registrationAction, forgotPasswordAction } from '../../actions/server/user/registration/action'

type AuthMode = 'login' | 'registration' | 'forgotPassword'

const AuthPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await loadAuthConfig()
        setAuthConfig(config)
        const mode = searchParams.get('mode') as AuthMode
        if (
          mode &&
          ['login', 'registration', 'forgotPassword'].includes(mode)
        ) {
          setAuthMode(mode)
        } else {
          setAuthMode('login') // Set login as default if no valid mode is provided
        }
      } catch (err) {
        console.error('Failed to load auth config:', err)
        setError('Failed to load authentication configuration')
      }
    }

    loadConfig()
  }, [searchParams])

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!authConfig) return null

  const currentSteps = authConfig.authentication[authMode]
  const currentStepConfig = currentSteps[currentStep - 1]

  const handleSubmit = async (formData: FormData) => {
    let result
    switch (authMode) {
      case 'login':
        // TODO: Implement loginAction
        // result = await loginAction(formData)
        break
      case 'registration':
        // TODO: Implement registrationAction
        // result = await registrationAction(formData)
        break
      case 'forgotPassword':
        // TODO: Implement forgotPasswordAction
        // result = await forgotPasswordAction(formData)
        break
    }

    // TODO: Handle the result
    // if (result.success) {
    //   if (currentStep < currentSteps.length) {
    //     setCurrentStep(currentStep + 1)
    //   } else {
    //     // Navigate to success page or next step in the process
    //     router.push('/dashboard')
    //   }
    // } else {
    //   // Handle error
    //   console.error(result.error)
    // }

    // Temporary: always advance to next step or redirect
    if (currentStep < currentSteps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push('/dashboard')
    }
  }

  const renderAuthStep = (step: AuthStep) => {
    switch (step.type) {
      case 'enterEmail':
        return [
          {
            name: 'email',
            label: 'Email Address',
            componentvariant: 'textfield' as const,
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch' as const,
            columnconfig: {
              row: 4,
              column: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
        ]
      case 'emailAndPasswordVerification':
        return [
          {
            name: 'email',
            label: 'Email Address',
            componentvariant: 'textfield' as const,
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch' as const,
            columnconfig: {
              row: 4,
              column: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 0.5,
            },
          },
          {
            name: 'password',
            label: 'Password',
            componentvariant: 'password' as const,
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch' as const,
            columnconfig: {
              row: 5,
              column: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
        ]
      case 'emailAndPasswordAndVerifyPasswordVerification':
        return [
          {
            name: 'email',
            label: 'Email Address',
            componentvariant: 'textfield' as const,
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch' as const,
            columnconfig: {
              row: 4,
              column: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 0.5,
            },
          },
          {
            name: 'password',
            label: 'Password',
            componentvariant: 'password' as const,
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch' as const,
            columnconfig: {
              row: 5,
              column: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 0.5,
            },
          },
          {
            name: 'verifyPassword',
            label: 'Verify Password',
            componentvariant: 'password' as const,
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch' as const,
            columnconfig: {
              row: 6,
              column: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
        ]
      default:
        return []
    }
  }

  const contentSectionProps = {
    grids: [
      {
        gridconfig: {
          gridname: 'authForm',
          alignment: 'left' as Alignment,
          gridwidth: '100%',
        },
        typography: [
          {
            fontcolor: black.main,
            text:
              authMode === 'login'
                ? 'Login'
                : authMode === 'registration'
                  ? 'Registration'
                  : 'Reset your password',
            fontvariant: 'merrih3' as const,
            columnconfig: {
              row: 1,
              column: 1,
              marginbottom: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            text:
              authMode === 'login'
                ? 'Welcome to Kaizen'
                : authMode === 'registration'
                  ? 'Welcome to Kaizen'
                  : 'Lost account access?',
            fontvariant: 'merrih4' as const,
            columnconfig: {
              row: 2,
              column: 1,
              marginbottom: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
            },
          },
          {
            fontcolor: black.main,
            fontvariant:
              authMode === 'forgotPassword'
                ? ('merrih5' as const)
                : ('merrih4' as const),
            text:
              authMode === 'login'
                ? 'Login to continue to the application'
                : authMode === 'registration'
                  ? 'Create your account to get started'
                  : 'Type in your email to start recovery',
            columnconfig: {
              row: 3,
              column: 1,
              gridname: 'authForm',
              alignment: 'left' as Alignment,
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
        ],
        styledcomponent: renderAuthStep(currentStepConfig),
      },
      {
        gridconfig: {
          gridname: 'authActions',
          alignment: 'center' as Alignment,
          gridwidth: '100%',
        },
        button: {
          text:
            authMode === 'login'
              ? 'Login'
              : authMode === 'registration'
                ? 'Start signup'
                : 'Recover Account',
          fontcolor: white.main,
          variant: 'contained' as const,
          backgroundcolor: black.main,
          width: authMode === 'forgotPassword' ? '150px' : '100px',
          fontvariant: 'merriparagraph' as const,
          columnconfig: {
            row: 1,
            column: 2,
            margintop: 1,
            gridname: 'authActions',
            alignment: 'center' as Alignment,
            columnwidth: '33.3%',
          },
          onClick: () => handleSubmit(new FormData()),
        },
        link: [
          authMode !== 'login'
            ? {
                link: '/auth',
                text:
                  authMode === 'registration'
                    ? 'Login instead'
                    : 'Back to login',
                fontcolor: marine.main,
                fontvariant: 'merriparagraph' as const,
                columnconfig: {
                  row: 1,
                  column: 1,
                  gridname: 'authActions',
                  alignment: 'left' as Alignment,
                  columnwidth: '33.3%',
                  margintop: 1,
                  marginright: 1,
                },
              }
            : null,
          authMode !== 'registration'
            ? {
                link: '/auth?mode=registration',
                text: 'Create account',
                fontcolor: marine.main,
                fontvariant: 'merriparagraph' as const,
                columnconfig: {
                  row: 1,
                  column: authMode === 'login' ? 1 : 3,
                  gridname: 'authActions',
                  alignment:
                    authMode === 'login'
                      ? ('left' as Alignment)
                      : ('right' as Alignment),
                  columnwidth: '33.3%',
                  margintop: 1,
                  marginleft: authMode === 'login' ? 0 : 1,
                  marginright: authMode === 'login' ? 1 : 0,
                },
              }
            : null,
          authMode !== 'forgotPassword'
            ? {
                link: '/auth?mode=forgotPassword',
                text: 'Forgot password',
                fontcolor: marine.main,
                fontvariant: 'merriparagraph' as const,
                columnconfig: {
                  row: 1,
                  column: 3,
                  gridname: 'authActions',
                  alignment: 'right' as Alignment,
                  columnwidth: '33.3%',
                  margintop: 1,
                  marginleft: 1,
                },
              }
            : null,
        ].filter((link): link is NonNullable<typeof link> => link !== null),
      },
    ],
  }

  return (
    <Dialog open maxWidth="xs" fullWidth>
      <Box
        component="form"
        onSubmit={e => {
          e.preventDefault()
          handleSubmit(new FormData(e.currentTarget))
        }}
        sx={formContainerStyle}
      >
        <ContentSection grids={contentSectionProps.grids} />
      </Box>
    </Dialog>
  )
}

export default AuthPage
