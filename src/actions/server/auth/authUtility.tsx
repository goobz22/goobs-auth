'use server'
import compareCookietoDB, {
  SerializableTokenData as CompareTokenData,
  ValidationResult,
} from './cookies/compareCookietoDB'
import updateCookie from './cookies/updateCookie'
import updateToken, {
  SerializableTokenData as UpdateTokenData,
} from './token/updateToken'

/**
 * Represents the possible modes for the auth utility.
 */
export type AuthMode = 'validate' | 'login' | 'logout'

/**
 * Represents the options for the auth utility.
 */
interface AuthUtilityOptions {
  /** The mode of operation for the auth utility */
  mode: AuthMode
  /** The token data to validate (for 'validate' mode) */
  tokenData?: CompareTokenData | null
  /** The name of the token to validate or manipulate */
  tokenName?: string
  /** The email for login (for 'login' mode) */
  email?: string
  /** The password for login (for 'login' mode) */
  password?: string
}

type ValidateResult = {
  isValid: boolean
  validationResult: ValidationResult
  identifier: string | undefined
}

type LoginResult = {
  success: boolean
  message: string
  token?: UpdateTokenData
}

type LogoutResult = {
  success: boolean
  message: string
}

/**
 * Comprehensive authentication utility for server components and server actions.
 *
 * This utility function handles various authentication operations based on the specified mode.
 * It can validate tokens, process logins, and manage logouts.
 *
 * @param options - The options for the auth utility
 * @param options.mode - The mode of operation ('validate', 'login', or 'logout')
 * @param options.tokenData - The token data to validate (required for 'validate' mode)
 * @param options.tokenName - The name of the token (defaults to 'loggedIn' for 'validate' mode)
 * @param options.email - The email for login (required for 'login' mode)
 * @param options.password - The password for login (required for 'login' mode)
 *
 * @returns A Promise that resolves to an object containing the result of the operation
 *
 * @throws {Error} If an invalid mode is provided
 */
export default async function authUtility(
  options: AuthUtilityOptions
): Promise<ValidateResult | LoginResult | LogoutResult> {
  console.log('🚀 Starting auth utility')
  console.log(`📡 Mode: ${options.mode}`)

  switch (options.mode) {
    case 'validate':
      console.log('🔍 Initiating token validation')
      return handleValidation(options.tokenData ?? null, options.tokenName)
    case 'login':
      console.log('🔐 Initiating login process')
      return handleLogin(options.email, options.password)
    case 'logout':
      console.log('🚪 Initiating logout process')
      return handleLogout(options.tokenData ?? null)
    default:
      console.error('❌ Invalid mode provided:', options.mode)
      throw new Error(`Invalid mode: ${options.mode}`)
  }
}

/**
 * Handles the token validation process.
 *
 * @param tokenData - The token data to validate
 * @param tokenName - The name of the token (defaults to 'loggedIn')
 * @returns An object containing the validation result and identifier
 */
async function handleValidation(
  tokenData: CompareTokenData | null,
  tokenName: string = 'loggedIn'
): Promise<ValidateResult> {
  console.log(`🔍 Validating token: ${tokenName}`)

  try {
    const { validationResult, identifier } = await compareCookietoDB(
      tokenName,
      tokenData
    )

    const isValid =
      validationResult.cookie?.status === 'valid' &&
      validationResult.database?.status === 'valid' &&
      validationResult.cookie?.tokenString ===
        validationResult.database?.tokenString

    console.log('📊 Validation result:', validationResult)
    console.log('🏷️ Identifier:', identifier?.[tokenName])
    console.log(isValid ? '✅ Token is valid' : '❌ Token is invalid')

    return {
      isValid,
      validationResult,
      identifier: identifier?.[tokenName],
    }
  } catch (error) {
    console.error('🔥 Error in handleValidation:', error)
    return {
      isValid: false,
      validationResult: {
        token: undefined,
        cookie: undefined,
        database: undefined,
      },
      identifier: undefined,
    }
  }
}

/**
 * Handles the login process.
 *
 * @param email - The user's email
 * @param password - The user's password
 * @returns An object containing the login result, a message, and the token if successful
 */
async function handleLogin(
  email?: string,
  password?: string
): Promise<LoginResult> {
  if (!email || !password) {
    console.warn('⚠️ Login attempted without email or password')
    return { success: false, message: 'Email and password are required' }
  }

  try {
    console.log(`🔐 Attempting login for email: ${email}`)
    // TODO: Implement actual user authentication logic here
    // This is a placeholder implementation
    if (email === 'user@example.com' && password === 'password123') {
      const token = await updateToken({
        tokenName: 'loggedIn',
        tokenString: '',
        tokenExpiration: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(), // 24 hours
        user: email,
      })

      await updateCookie({
        cookie: {
          tokenName: token.tokenName,
          tokenString: token.tokenString,
          expiration: new Date(token.tokenExpiration),
          update: true,
          valid: true,
        },
      })

      console.log('✅ Login successful')
      return { success: true, message: 'Login successful', token }
    } else {
      console.log('❌ Login failed: Invalid credentials')
      return { success: false, message: 'Invalid email or password' }
    }
  } catch (error) {
    console.error('🔥 Error in handleLogin:', error)
    return { success: false, message: 'Login failed' }
  }
}

/**
 * Handles the logout process.
 *
 * @param tokenData - The token data of the current session
 * @returns An object indicating the success of the logout operation and a message
 */
async function handleLogout(
  tokenData: CompareTokenData | null
): Promise<LogoutResult> {
  if (!tokenData) {
    console.warn('⚠️ Logout attempted without an active session')
    return { success: false, message: 'No active session' }
  }

  try {
    console.log(`🚪 Logging out user with token: ${tokenData.tokenName}`)
    await updateCookie({
      cookie: {
        tokenName: tokenData.tokenName,
        tokenString: '',
        expiration: new Date(0),
        update: true,
        valid: false,
      },
    })

    // TODO: Implement any additional logout logic here (e.g., invalidating the token in the database)

    console.log('✅ Logout successful')
    return { success: true, message: 'Logout successful' }
  } catch (error) {
    console.error('🔥 Error in handleLogout:', error)
    return { success: false, message: 'Logout failed' }
  }
}
