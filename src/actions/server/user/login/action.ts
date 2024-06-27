'use server'
import { getFormData } from 'goobs-repo'
import updateCookie from './../../../../actions/server/auth/cookies/updateCookie'
import updateToken from './../../../../actions/server/auth/token/updateToken'

interface SerializableUserData {
  _id: string
  email: string
  // Add other user fields as needed
}

interface SerializableTokenData {
  tokenName: string
  tokenString: string
  tokenExpiration: string
  user: string
}

export default async function loginAction(formData: FormData): Promise<{
  success: boolean
  redirectPath?: string
  user?: SerializableUserData
  token?: SerializableTokenData
}> {
  console.log('Starting login process...')

  try {
    const formDataResult = await getFormData(formData)
    const email = formDataResult.email
    const password = formDataResult.password

    if (typeof email !== 'string' || typeof password !== 'string') {
      console.log('Invalid email or password format')
      return { success: false }
    }

    // TODO: Replace with your own user lookup logic
    const user: SerializableUserData | undefined = {
      _id: 'user-id',
      email: email,
      // Add other user fields as needed
    }

    if (!user || password !== 'correct-password') {
      console.log('Invalid email or password')
      return { success: false }
    }

    const tokenDetails = await updateToken({
      tokenName: 'loggedInToken',
      tokenString: '',
      tokenExpiration: new Date().toISOString(),
      user: user._id,
    })

    if (
      tokenDetails &&
      tokenDetails.tokenName &&
      tokenDetails.tokenString &&
      tokenDetails.tokenExpiration
    ) {
      console.log('Setting the tokens in the session...')
      await updateCookie({
        cookie: {
          update: true,
          valid: true,
          status: 'Updated',
          tokenName: tokenDetails.tokenName,
          tokenString: tokenDetails.tokenString,
          expiration: new Date(tokenDetails.tokenExpiration),
        },
      })

      const tokenData: SerializableTokenData = {
        tokenName: tokenDetails.tokenName,
        tokenString: tokenDetails.tokenString,
        tokenExpiration: tokenDetails.tokenExpiration,
        user: user._id,
      }

      console.log('Login successful')
      return {
        success: true,
        redirectPath: '/dashboard',
        user: user,
        token: tokenData,
      }
    } else {
      console.log('No tokens set')
      return { success: false }
    }
  } catch (error) {
    console.error('Error in loginAction:', error)
    return { success: false }
  }
}
