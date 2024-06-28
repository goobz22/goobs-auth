'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Box, Dialog, CircularProgress } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ContentSection,
  ContentSectionProps,
  formContainerStyle,
  Alignment,
  black,
  ExtendedButtonProps,
  white,
  marine,
  TypographyPropsVariantOverrides,
  setReusableStore,
} from 'goobs-repo'
import loadAuthConfig, {
  AuthConfig,
  AuthStep,
} from '../../actions/server/auth/configLoader'
import { verifyEmail } from '../../actions/server/email/verify'
import { sendEmail } from '../../actions/server/email/send'
import sendSMS from '../../actions/server/twilio/send'
import verifyUser from '../../actions/server/twilio/verify'

type AuthMode = 'login' | 'registration' | 'forgotPassword'

const AuthPageInner: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [verificationCode] = useState('')
  const [isVerificationCodeValid, setIsVerificationCodeValid] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

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
          setAuthMode('login')
        }
      } catch (err) {
        console.error('Failed to load auth config:', err)
      }
    }

    loadConfig()
  }, [searchParams])

  if (!authConfig) return null

  const currentSteps = authConfig.authentication[authMode]
  const currentStepConfig = currentSteps[currentStep - 1]

  const saveFormDataToCache = async (formData: FormData) => {
    const data: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString()
    }
    setFormData(prevData => ({ ...prevData, ...data }))
    await setReusableStore(
      `${authMode}FormData`,
      { type: 'hash', value: data },
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    )
  }

  const handleSubmit = async (formData: FormData) => {
    await saveFormDataToCache(formData)
    if (currentStep < currentSteps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // TODO: Implement final form submission logic
      console.log('Final step reached. Ready to submit all data.')
      router.push('/dashboard')
    }
  }

  const handleEmailVerification = async () => {
    try {
      const email = formData['email']
      const isValid = await verifyEmail({ email, code: verificationCode })
      if (isValid) {
        console.log('Email verification successful')
        setCurrentStep(currentStep + 1)
      } else {
        console.log('Email verification failed')
        setIsVerificationCodeValid(false)
      }
    } catch (error) {
      console.error('Error verifying email:', error)
    }
  }

  const handleResendEmail = async () => {
    try {
      const email = formData['email']
      await sendEmail({
        to: email,
        subject: 'Verification Code',
        html: 'Your verification code is: ', // The code will be appended in the sendEmail function
      })
      console.log('Verification email resent successfully')
    } catch (error) {
      console.error('Error resending verification email:', error)
    }
  }

  const handlePhoneVerification = async () => {
    try {
      const phoneNumber = formData['phoneNumber']
      const isValid = await verifyUser(phoneNumber, verificationCode)
      if (isValid) {
        console.log('Phone number verification successful')
        setCurrentStep(currentStep + 1)
      } else {
        console.log('Phone number verification failed')
        setIsVerificationCodeValid(false)
      }
    } catch (error) {
      console.error('Error verifying phone number:', error)
    }
  }

  const handleResendSMS = async () => {
    try {
      const phoneNumber = formData['phoneNumber']
      await sendSMS(phoneNumber)
      console.log('Verification code resent successfully')
    } catch (error) {
      console.error('Error resending verification code:', error)
    }
  }

  const handleAccountInfoSubmit = async (formData: FormData) => {
    await saveFormDataToCache(formData)
    console.log('Advancing to next step from current step.')
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      // If on the first step, go back to login
      router.push('/auth')
    }
  }

  const renderAuthStep = (
    step: AuthStep
  ): ContentSectionProps['styledcomponent'] => {
    switch (step.type) {
      case 'enterEmail':
        return [
          {
            name: 'email',
            label: 'Email Address',
            componentvariant: 'textfield',
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch',
            columnconfig: {
              row: 4,
              column: 1,
              alignment: 'left',
              columnwidth: '100%',
              marginbottom: 1,
            },
            formname: 'enterEmailForm',
          },
        ]
      case 'emailAndPasswordVerification':
        return [
          {
            name: 'email',
            label: 'Email Address',
            componentvariant: 'textfield',
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch',
            columnconfig: {
              row: 4,
              column: 1,
              alignment: 'left',
              columnwidth: '100%',
              marginbottom: 0.5,
            },
            formname: 'emailAndPasswordVerificationForm',
          },
          {
            name: 'password',
            label: 'Password',
            componentvariant: 'password',
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch',
            columnconfig: {
              row: 5,
              column: 1,
              alignment: 'left',
              columnwidth: '100%',
              marginbottom: 1,
            },
            formname: 'emailAndPasswordVerificationForm',
          },
        ]
      case 'emailAndPasswordAndVerifyPasswordVerification':
        return [
          {
            name: 'email',
            label: 'Email Address',
            required: true,
            componentvariant: 'textfield',
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch',
            columnconfig: {
              row: 4,
              column: 1,
              alignment: 'left',
              columnwidth: '100%',
              marginbottom: 0.5,
            },
            formname: 'emailAndPasswordAndVerifyPasswordVerificationForm',
          },
          {
            name: 'verifyPassword',
            label: 'Password',
            componentvariant: 'password',
            outlinecolor: black.main,
            required: true,
            shrunklabellocation: 'onnotch',
            columnconfig: {
              row: 5,
              column: 1,
              alignment: 'left',
              columnwidth: '100%',
              marginbottom: 0.5,
            },
            formname: 'emailAndPasswordAndVerifyPasswordVerificationForm',
          },
          {
            name: 'confirmPassword',
            label: 'Verify Password',
            componentvariant: 'password',
            required: true,
            outlinecolor: black.main,
            shrunklabellocation: 'onnotch',
            columnconfig: {
              row: 6,
              column: 1,
              alignment: 'left',
              columnwidth: '100%',
              marginbottom: 1,
            },
            formname: 'emailAndPasswordAndVerifyPasswordVerificationForm',
          },
        ]
      case 'emailVerification':
      case 'textMessageVerification':
        return []
      case 'accountInfo':
        return [
          {
            label: 'First Name',
            outlinecolor: black.main,
            componentvariant: 'textfield',
            required: true,
            name: 'firstName',
            formname: 'accountInfoForm',
            columnconfig: {
              row: 5,
              column: 1,
              alignment: 'left',
              columnwidth: '100%',
              marginbottom: 1,
            },
          },
          {
            label: 'Last Name',
            outlinecolor: black.main,
            componentvariant: 'textfield',
            name: 'lastName',
            required: true,
            formname: 'accountInfoForm',
            columnconfig: {
              row: 6,
              column: 1,
              marginbottom: 1,
              alignment: 'left',
              columnwidth: '100%',
            },
          },
          {
            label: 'Phone Number',
            outlinecolor: black.main,
            componentvariant: 'phonenumber',
            name: 'phoneNumber',
            required: true,
            formname: 'accountInfoForm',
            columnconfig: {
              row: 7,
              column: 1,
              alignment: 'left',
              columnwidth: '100%',
            },
          },
        ]
      default:
        return []
    }
  }

  const contentSectionProps: ContentSectionProps[] = [
    {
      gridconfig: {
        alignment: 'left',
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
          fontvariant: 'merrih3',
          columnconfig: {
            row: 1,
            column: 1,
            marginbottom: 1,
            alignment: 'left',
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
          fontvariant: 'merrih4',
          columnconfig: {
            row: 2,
            column: 1,
            marginbottom: 1,
            alignment: 'left',
            columnwidth: '100%',
          },
        },
        {
          fontcolor: black.main,
          fontvariant: authMode === 'forgotPassword' ? 'merrih5' : 'merrih4',
          text:
            authMode === 'login'
              ? 'Login to continue to the application'
              : authMode === 'registration'
                ? 'Create your account to get started'
                : 'Type in your email to start recovery',
          columnconfig: {
            row: 3,
            column: 1,
            alignment: 'left',
            columnwidth: '100%',
            marginbottom: 1,
          },
        },
      ],
      styledcomponent: renderAuthStep(currentStepConfig),
      confirmationcodeinput:
        currentStepConfig.type === 'emailVerification' ||
        currentStepConfig.type === 'textMessageVerification'
          ? {
              identifier: 'verificationCode',
              isValid: isVerificationCodeValid,
              columnconfig: {
                row: 4,
                column: 1,
                alignment: 'left',
                columnwidth: '100%',
                marginbottom: 1,
              },
            }
          : undefined,
    },
    {
      gridconfig: {
        alignment: 'center',
        gridwidth: '100%',
      },
      button:
        currentStepConfig.type === 'accountInfo'
          ? [
              {
                text: 'Back',
                fontcolor: black.main,
                variant: 'outlined' as const,
                outlinecolor: black.main,
                width: '100%',
                fontvariant:
                  'merriparagraph' as keyof TypographyPropsVariantOverrides,
                columnconfig: {
                  row: 1,
                  column: 1,
                  margintop: 2,
                  marginright: 1,
                  alignment: 'center' as Alignment,
                  columnwidth: '48%',
                },
                onClick: handleBack,
              } as ExtendedButtonProps,
              {
                text: 'Continue',
                fontcolor: white.main,
                variant: 'contained' as const,
                backgroundcolor: black.main,
                width: '100%',
                fontvariant:
                  'merriparagraph' as keyof TypographyPropsVariantOverrides,
                columnconfig: {
                  row: 1,
                  column: 2,
                  margintop: 2,
                  marginleft: 1,
                  alignment: 'center' as Alignment,
                  columnwidth: '48%',
                },
                onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault()
                  const form = e.currentTarget.closest('form')
                  if (form) {
                    handleAccountInfoSubmit(new FormData(form))
                  }
                },
                formname: 'accountInfoForm',
              } as ExtendedButtonProps,
            ]
          : currentStepConfig.type === 'emailVerification'
            ? [
                {
                  text: 'Verify Email',
                  fontcolor: white.main,
                  variant: 'contained' as const,
                  backgroundcolor: black.main,
                  width: '100%',
                  fontvariant:
                    'merriparagraph' as keyof TypographyPropsVariantOverrides,
                  columnconfig: {
                    row: 1,
                    column: 2,
                    margintop: 1,
                    alignment: 'center' as Alignment,
                    columnwidth: '33.3%',
                  },
                  onClick: handleEmailVerification,
                  formname: 'emailVerificationForm',
                } as ExtendedButtonProps,
                {
                  text: 'Resend Email',
                  fontcolor: white.main,
                  variant: 'contained' as const,
                  backgroundcolor: black.main,
                  width: '120px',
                  fontvariant:
                    'merriparagraph' as keyof TypographyPropsVariantOverrides,
                  columnconfig: {
                    row: 1,
                    column: 1,
                    margintop: 1,
                    alignment: 'center' as Alignment,
                    columnwidth: '33.3%',
                  },
                  onClick: handleResendEmail,
                  formname: 'emailVerificationForm',
                } as ExtendedButtonProps,
              ]
            : currentStepConfig.type === 'textMessageVerification'
              ? [
                  {
                    text: 'Verify Phone',
                    fontcolor: white.main,
                    variant: 'contained' as const,
                    backgroundcolor: black.main,
                    width: '100%',
                    fontvariant:
                      'merriparagraph' as keyof TypographyPropsVariantOverrides,
                    columnconfig: {
                      row: 1,
                      column: 2,
                      margintop: 1,
                      alignment: 'center' as Alignment,
                      columnwidth: '33.3%',
                    },
                    onClick: handlePhoneVerification,
                    formname: 'textMessageVerificationForm',
                  } as ExtendedButtonProps,
                  {
                    text: 'Resend SMS',
                    fontcolor: white.main,
                    variant: 'contained' as const,
                    backgroundcolor: black.main,
                    width: '120px',
                    fontvariant:
                      'merriparagraph' as keyof TypographyPropsVariantOverrides,
                    columnconfig: {
                      row: 1,
                      column: 1,
                      margintop: 1,
                      alignment: 'center' as Alignment,
                      columnwidth: '33.3%',
                    },
                    onClick: handleResendSMS,
                    formname: 'textMessageVerificationForm',
                  } as ExtendedButtonProps,
                ]
              : authMode === 'login'
                ? [
                    {
                      text: 'Login',
                      fontcolor: white.main,
                      variant: 'contained' as const,
                      backgroundcolor: black.main,
                      width: '100%',
                      fontvariant:
                        'merriparagraph' as keyof TypographyPropsVariantOverrides,
                      columnconfig: {
                        row: 1,
                        column: 2,
                        margintop: 1,
                        alignment: 'center' as Alignment,
                        columnwidth: '33.3%',
                      },
                      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault()
                        const form = e.currentTarget.closest('form')
                        if (form) {
                          handleSubmit(new FormData(form))
                        }
                      },
                      formname: 'emailAndPasswordVerificationForm',
                    } as ExtendedButtonProps,
                  ]
                : authMode === 'registration'
                  ? [
                      {
                        text: 'Start signup',
                        fontcolor: white.main,
                        variant: 'contained' as const,
                        backgroundcolor: black.main,
                        width: '100%',
                        fontvariant:
                          'merriparagraph' as keyof TypographyPropsVariantOverrides,
                        columnconfig: {
                          row: 1,
                          column: 2,
                          margintop: 1,
                          alignment: 'center' as Alignment,
                          columnwidth: '33.3%',
                        },
                        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault()
                          const form = e.currentTarget.closest('form')
                          if (form) {
                            handleSubmit(new FormData(form))
                          }
                        },
                        formname:
                          'emailAndPasswordAndVerifyPasswordVerificationForm',
                      } as ExtendedButtonProps,
                    ]
                  : [
                      {
                        text: 'Recover Account',
                        fontcolor: white.main,
                        variant: 'contained' as const,
                        backgroundcolor: black.main,
                        width: '100%',
                        fontvariant:
                          'merriparagraph' as keyof TypographyPropsVariantOverrides,
                        columnconfig: {
                          row: 1,
                          column: 2,
                          margintop: 1,
                          alignment: 'center' as Alignment,
                          columnwidth: '33.3%',
                        },
                        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault()
                          const form = e.currentTarget.closest('form')
                          if (form) {
                            handleSubmit(new FormData(form))
                          }
                        },
                        formname: 'enterEmailForm',
                      } as ExtendedButtonProps,
                    ],
      link:
        currentStepConfig.type === 'emailAndPasswordVerification' ||
        currentStepConfig.type ===
          'emailAndPasswordAndVerifyPasswordVerification' ||
        currentStepConfig.type === 'enterEmail'
          ? currentStepConfig.type === 'emailAndPasswordVerification'
            ? [
                {
                  link: '/auth',
                  text: 'Login instead',
                  fontcolor: marine.main,
                  fontvariant:
                    'merriparagraph' as keyof TypographyPropsVariantOverrides,
                  columnconfig: {
                    row: 1,
                    column: 1,
                    alignment: 'left' as Alignment,
                    columnwidth: '33%',
                    margintop: 1,
                  },
                },
                {
                  link: '/auth?mode=forgotPassword',
                  text: 'Forgot password',
                  fontcolor: marine.main,
                  fontvariant:
                    'merriparagraph' as keyof TypographyPropsVariantOverrides,
                  columnconfig: {
                    row: 1,
                    column: 3,
                    alignment: 'right' as Alignment,
                    columnwidth: '33%',
                    margintop: 1,
                  },
                },
              ]
            : currentStepConfig.type ===
                'emailAndPasswordAndVerifyPasswordVerification'
              ? [
                  {
                    link: '/auth',
                    text: 'Login instead',
                    fontcolor: marine.main,
                    fontvariant:
                      'merriparagraph' as keyof TypographyPropsVariantOverrides,
                    columnconfig: {
                      row: 1,
                      column: 1,
                      alignment: 'left' as Alignment,
                      columnwidth: '33%',
                      margintop: 1,
                    },
                  },
                  {
                    link: '/auth?mode=forgotPassword',
                    text: 'Forgot password',
                    fontcolor: marine.main,
                    fontvariant:
                      'merriparagraph' as keyof TypographyPropsVariantOverrides,
                    columnconfig: {
                      row: 1,
                      column: 3,
                      alignment: 'right' as Alignment,
                      columnwidth: '33%',
                      margintop: 1,
                    },
                  },
                ]
              : [
                  {
                    link: '/auth?mode=registration',
                    text: 'Create account',
                    fontcolor: marine.main,
                    fontvariant:
                      'merriparagraph' as keyof TypographyPropsVariantOverrides,
                    columnconfig: {
                      row: 1,
                      column: 1,
                      alignment: 'left' as Alignment,
                      columnwidth: '33%',
                      margintop: 1,
                    },
                  },
                  {
                    link: '/auth?mode=forgotPassword',
                    text: 'Forgot password',
                    fontcolor: marine.main,
                    fontvariant:
                      'merriparagraph' as keyof TypographyPropsVariantOverrides,
                    columnconfig: {
                      row: 1,
                      column: 3,
                      alignment: 'right' as Alignment,
                      columnwidth: '33%',
                      margintop: 1,
                    },
                  },
                ]
          : undefined,
    },
  ]

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
        <ContentSection grids={contentSectionProps} />
      </Box>
    </Dialog>
  )
}

const AuthPageContent: React.FC = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <AuthPageInner />
    </Suspense>
  )
}

export default AuthPageContent
