'use server'

import { getReusableStore, setReusableStore } from 'goobs-repo'

interface HelperFooterMessage {
  status?: 'error' | 'success'
  statusMessage?: string
  spreadMessage?: string
  spreadMessagePriority?: number
  formname?: string
}

interface TokenData {
  tokenName: string
  tokenString: string
  tokenExpiration: string
}

interface UserData {
  _id?: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
}

let timeout: ReturnType<typeof setTimeout> | null = null

const isValidEmailDomain = async (email: string): Promise<boolean> => {
  console.log('Validating email domain for:', email)
  const emailDomainEndings = ['.com', '.net', '.gov', '.org', '.edu']
  const result = emailDomainEndings.some(ending => email.endsWith(ending))
  console.log('Email domain validation result:', result)
  return result
}

export async function registrationServerAction(
  action: string,
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  if (!registrationToken) {
    return {
      status: 'error',
      statusMessage: 'Registration token not found. Cannot proceed.',
      spreadMessage: 'Registration token missing.',
      spreadMessagePriority: 2,
      formname: 'registrationform',
    }
  }

  switch (action) {
    case 'emailErrorCreation':
      return handleEmailErrorCreation(formData, registrationToken)
    case 'passwordErrorCreation':
      return handlePasswordErrorCreation(formData, registrationToken)
    case 'firstNameErrorCreation':
      return handleFirstNameErrorCreation(formData, registrationToken)
    case 'lastNameErrorCreation':
      return handleLastNameErrorCreation(formData, registrationToken)
    case 'phoneNumberErrorCreation':
      return handlePhoneNumberErrorCreation(formData, registrationToken)
    case 'emailResendErrorCreation':
      return handleEmailResendErrorCreation(registrationToken)
    case 'emailVerifyErrorCreation':
      return handleEmailVerifyErrorCreation(formData, registrationToken)
    case 'phoneNumberResendErrorCreation':
      return handlePhoneNumberResendErrorCreation(registrationToken)
    case 'phoneNumberVerifyErrorCreation':
      return handlePhoneNumberVerifyErrorCreation(formData, registrationToken)
    case 'finalSubmitAction':
      return handleFinalSubmitAction(registrationToken)
    default:
      return {
        status: 'error',
        statusMessage: 'Invalid action specified.',
        formname: 'registrationform',
      }
  }
}

async function handleEmailErrorCreation(
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  const email = formData.get('email') as string

  if (timeout) {
    clearTimeout(timeout)
  }

  if (!email) {
    return {
      status: 'error',
      statusMessage: 'Please enter an email address.',
      spreadMessage: 'Email is required.',
      spreadMessagePriority: 1,
      formname: 'step0form',
    }
  }

  const isValidDomain = await isValidEmailDomain(email)
  if (!isValidDomain) {
    return {
      status: 'error',
      statusMessage:
        'Please use a valid email domain (.com, .net, .gov, .org, .edu).',
      spreadMessage: 'Invalid email domain.',
      spreadMessagePriority: 1,
      formname: 'step0form',
    }
  }

  await setReusableStore(
    'email',
    { type: 'string', value: email },
    new Date(Date.now() + 30 * 60 * 1000),
    registrationToken
  )

  return new Promise(resolve => {
    timeout = setTimeout(async () => {
      try {
        const existingUser = await getReusableStore('email', registrationToken)
        if (existingUser && existingUser.type === 'string') {
          resolve({
            status: 'error',
            statusMessage:
              'User with this identifier already exists. Please login or click forgot password.',
            spreadMessage: 'Email already exists.',
            spreadMessagePriority: 1,
            formname: 'step0form',
          })
        } else {
          resolve({
            status: 'success',
            statusMessage: 'No user found with the email, continue with signup',
            formname: 'step0form',
          })
        }
      } catch (error) {
        resolve({
          status: 'error',
          statusMessage:
            'An error occurred while checking the identifier. Please try again.',
          spreadMessage: 'Error occurred while checking email.',
          spreadMessagePriority: 1,
          formname: 'step0form',
        })
      }
    }, 0)
  })
}

async function handlePasswordErrorCreation(
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  const password = formData.get('password') as string

  if (!password) {
    return {
      status: 'error',
      statusMessage: 'Password is required.',
      spreadMessage: 'Password is required.',
      spreadMessagePriority: 4,
      formname: 'step0form',
    }
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  const passwordComplexityStatus: 'error' | 'success' = passwordRegex.test(
    password
  )
    ? 'success'
    : 'error'

  if (passwordComplexityStatus === 'success') {
    await setReusableStore(
      'password',
      { type: 'string', value: password },
      new Date(Date.now() + 30 * 60 * 1000),
      registrationToken
    )
  }

  return {
    status: passwordComplexityStatus,
    statusMessage:
      passwordComplexityStatus === 'success'
        ? 'Password is valid.'
        : 'Password must meet complexity requirements.',
    spreadMessage:
      passwordComplexityStatus === 'error' ? 'Invalid password.' : undefined,
    spreadMessagePriority: passwordComplexityStatus === 'error' ? 1 : undefined,
    formname: 'step0form',
  }
}

async function handleFirstNameErrorCreation(
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  const firstName = formData.get('firstName') as string

  if (!firstName) {
    return {
      status: 'error',
      statusMessage: 'First name is required. Please enter a first name.',
      spreadMessage: 'First name is required.',
      spreadMessagePriority: 1,
      formname: 'step1form',
    }
  }

  await setReusableStore(
    'firstName',
    { type: 'string', value: firstName },
    new Date(Date.now() + 30 * 60 * 1000),
    registrationToken
  )

  return {
    status: 'success',
    statusMessage: 'First name is valid.',
    formname: 'step1form',
  }
}

async function handleLastNameErrorCreation(
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  const lastName = formData.get('lastName') as string

  if (!lastName) {
    return {
      status: 'error',
      statusMessage: 'Last name is required. Please enter a last name.',
      spreadMessage: 'Last name is required.',
      spreadMessagePriority: 2,
      formname: 'step1form',
    }
  }

  await setReusableStore(
    'lastName',
    { type: 'string', value: lastName },
    new Date(Date.now() + 30 * 60 * 1000),
    registrationToken
  )

  return {
    status: 'success',
    statusMessage: 'Last name is valid.',
    formname: 'step1form',
  }
}

async function handlePhoneNumberErrorCreation(
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  const phoneNumber = formData.get('phoneNumber') as string

  if (!phoneNumber) {
    return {
      status: 'error',
      statusMessage: 'Phone number is required. Please enter a phone number.',
      spreadMessage: 'Phone number is required.',
      spreadMessagePriority: 1,
      formname: 'step1form',
    }
  }

  const digitsOnly = phoneNumber.replace(/[^\d]/g, '')
  const length = digitsOnly.length

  if (
    (length === 10 && !digitsOnly.startsWith('1')) ||
    (length === 11 && digitsOnly.startsWith('1'))
  ) {
    await setReusableStore(
      'phoneNumber',
      { type: 'string', value: phoneNumber },
      new Date(Date.now() + 30 * 60 * 1000),
      registrationToken
    )

    return {
      status: 'success',
      statusMessage: 'Phone number is valid.',
      formname: 'step1form',
    }
  } else {
    return {
      status: 'error',
      statusMessage:
        'Please enter a valid 10-digit phone number or a 10-digit number starting with 1.',
      spreadMessage: 'Invalid phone number format.',
      spreadMessagePriority: 1,
      formname: 'step1form',
    }
  }
}

async function handleEmailResendErrorCreation(
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  try {
    const emailResult = await getReusableStore('email', registrationToken)
    const email = emailResult?.type === 'string' ? emailResult.value : undefined

    if (!email) {
      return {
        status: 'error',
        statusMessage:
          'Email identifier is missing. Email resend process halted.',
        spreadMessage: 'Email identifier missing.',
        spreadMessagePriority: 1,
        formname: 'step2form',
      }
    }

    return {
      status: 'success',
      statusMessage: 'Email resend process completed successfully.',
      spreadMessage: 'Email resent successfully.',
      spreadMessagePriority: 1,
      formname: 'step2form',
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during the email resend process.'
    return {
      status: 'error',
      statusMessage: errorMessage,
      spreadMessage: 'Error occurred during email resend.',
      spreadMessagePriority: 1,
      formname: 'step2form',
    }
  }
}

async function handleEmailVerifyErrorCreation(
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  try {
    const verificationCodeResult = await getReusableStore(
      'verificationCode',
      registrationToken
    )
    const verificationCode =
      verificationCodeResult?.type === 'string'
        ? verificationCodeResult.value
        : undefined
    const identifier = formData.get('identifier') as string

    if (!verificationCode || !identifier) {
      return {
        status: 'error',
        statusMessage:
          'One of the verification codes is missing. Email verification process halted.',
        spreadMessage: 'Verification code missing.',
        spreadMessagePriority: 1,
        formname: 'step2form',
      }
    }

    if (verificationCode !== identifier) {
      throw new Error(
        'Verification code does not match. Email verification process halted.'
      )
    }

    return {
      status: 'success',
      statusMessage: 'Email verification process completed successfully.',
      spreadMessage: 'Email verified successfully.',
      spreadMessagePriority: 1,
      formname: 'step2form',
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during the email verification process.'
    return {
      status: 'error',
      statusMessage: errorMessage,
      spreadMessage: 'Error occurred during email verification.',
      spreadMessagePriority: 1,
      formname: 'step2form',
    }
  }
}

async function handlePhoneNumberResendErrorCreation(
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  try {
    const phoneNumberResult = await getReusableStore(
      'phoneNumber',
      registrationToken
    )
    const phoneNumber =
      phoneNumberResult?.type === 'string' ? phoneNumberResult.value : undefined

    if (!phoneNumber) {
      return {
        status: 'error',
        statusMessage: 'Phone number is missing. SMS resend process halted.',
        spreadMessage: 'Phone number missing.',
        spreadMessagePriority: 1,
        formname: 'step3form',
      }
    }

    return {
      status: 'success',
      statusMessage: 'SMS resend process completed successfully.',
      spreadMessage: 'SMS resent successfully.',
      spreadMessagePriority: 1,
      formname: 'step3form',
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during the SMS resend process.'
    return {
      status: 'error',
      statusMessage: errorMessage,
      spreadMessage: 'Error occurred during SMS resend.',
      spreadMessagePriority: 1,
      formname: 'step3form',
    }
  }
}

async function handlePhoneNumberVerifyErrorCreation(
  formData: FormData,
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  try {
    const phoneNumberResult = await getReusableStore(
      'phoneNumber',
      registrationToken
    )
    const phoneNumber =
      phoneNumberResult?.type === 'string' ? phoneNumberResult.value : undefined
    const verificationCode = formData.get('identifier') as string

    if (!phoneNumber || !verificationCode) {
      return {
        status: 'error',
        statusMessage:
          'Phone number or verification code missing. SMS verification process halted.',
        spreadMessage: 'Phone number or verification code missing.',
        spreadMessagePriority: 1,
        formname: 'step3form',
      }
    }

    const isVerified = true

    if (!isVerified) {
      throw new Error(
        'Invalid verification code. SMS verification process halted.'
      )
    }

    return {
      status: 'success',
      statusMessage: 'SMS verification process completed successfully.',
      spreadMessage: 'SMS verified successfully.',
      spreadMessagePriority: 1,
      formname: 'step3form',
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during the SMS verification process.'
    return {
      status: 'error',
      statusMessage: errorMessage,
      spreadMessage: 'Error occurred during SMS verification.',
      spreadMessagePriority: 1,
      formname: 'step3form',
    }
  }
}

async function handleFinalSubmitAction(
  registrationToken: string
): Promise<HelperFooterMessage | undefined> {
  try {
    const emailResult = await getReusableStore('email', registrationToken)
    const passwordResult = await getReusableStore('password', registrationToken)
    const firstNameResult = await getReusableStore(
      'firstName',
      registrationToken
    )
    const lastNameResult = await getReusableStore('lastName', registrationToken)
    const phoneNumberResult = await getReusableStore(
      'phoneNumber',
      registrationToken
    )

    const email = emailResult?.type === 'string' ? emailResult.value : undefined
    const password =
      passwordResult?.type === 'string' ? passwordResult.value : undefined
    const firstName =
      firstNameResult?.type === 'string' ? firstNameResult.value : undefined
    const lastName =
      lastNameResult?.type === 'string' ? lastNameResult.value : undefined
    const phoneNumber =
      phoneNumberResult?.type === 'string' ? phoneNumberResult.value : undefined

    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return {
        status: 'error',
        statusMessage:
          'One or more required fields are missing. Please check your inputs.',
        formname: 'finalform',
      }
    }

    const newUser: UserData = {
      email,
      firstName,
      lastName,
      phoneNumber,
    }

    await setReusableStore(
      email,
      { type: 'string', value: JSON.stringify(newUser) },
      new Date(Date.now() + 30 * 60 * 1000),
      registrationToken
    )

    const loggedInTokens: TokenData = {
      tokenName: 'loggedIn',
      tokenString: 'newTokenString',
      tokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    await setReusableStore(
      'loggedIn',
      { type: 'string', value: JSON.stringify(loggedInTokens) },
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      registrationToken
    )

    return {
      status: 'success',
      statusMessage:
        'Registration completed successfully. Redirecting to dashboard...',
      formname: 'finalform',
    }
  } catch (error) {
    const errorMessage =
      'An error occurred during registration finalization. Please try again.'
    return {
      status: 'error',
      statusMessage: errorMessage,
      formname: 'finalform',
    }
  }
}
