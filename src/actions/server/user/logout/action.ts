'use server'
import updateCookie from './../../../../actions/server/auth/cookies/updateCookie'

interface SerializableTokenData {
  _id: string
  tokenName: string
  tokenString: string
  tokenExpiration: string
  user: string
}

export default async function logoutAction(
  loggedInToken: SerializableTokenData | null
): Promise<{ success: boolean; message?: string; deleteToken?: boolean }> {
  console.log('Starting logout process...')

  try {
    if (!loggedInToken) {
      console.log('No logged in token provided')
      return { success: false, message: 'No active session found' }
    }

    // Clear the cookie
    await updateCookie({
      cookie: {
        update: true,
        valid: false,
        status: 'Logged out',
        tokenName: '',
        tokenString: '',
        expiration: new Date(0), // Set to epoch to expire the cookie
      },
    })

    console.log('Logout successful')
    return {
      success: true,
      message: 'Logged out successfully',
      deleteToken: true,
    }
  } catch (error) {
    console.error('Error in logoutAction:', error)
    return { success: false, message: 'An error occurred during logout' }
  }
}
