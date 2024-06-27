'use server'
import compareCookietoDB, {
  SerializableTokenData,
} from './cookies/compareCookietoDB'

interface ValidTokens {
  token?: Partial<SerializableTokenData>
  cookie?: Partial<SerializableTokenData> & {
    valid: boolean
  }
}

// Variant of authUtility intended for server components
export default async function serverComponentsAuthUtility(
  tokenData: SerializableTokenData | null
): Promise<{
  isValid: boolean
  validTokens: ValidTokens
}> {
  const compareCookieToDBTokenData: SerializableTokenData | null = tokenData
    ? {
        tokenName: tokenData.tokenName,
        tokenString: tokenData.tokenString,
        tokenExpiration: tokenData.tokenExpiration,
        user: tokenData.user,
      }
    : null

  const { validationResult } = await compareCookietoDB(
    'loggedIn',
    compareCookieToDBTokenData
  )
  const { token, cookie, database } = validationResult
  const validTokens: ValidTokens = {}
  let isValid = false

  if (token?.tokenName === 'loggedIn') {
    if (cookie?.status === 'invalid') {
      console.log('Invalid loggedIn token combination.')
      return { isValid, validTokens }
    } else if (cookie?.tokenExpiration && cookie.tokenExpiration < new Date()) {
      console.log('LoggedIn token expired.')
      return { isValid, validTokens }
    } else if (cookie?.status === 'valid') {
      validTokens.token = {
        tokenName: token.tokenName,
        tokenString: token.tokenString,
        tokenExpiration: token.tokenExpiration
          ? new Date(token.tokenExpiration)
          : undefined,
        user: token.user,
      }
      validTokens.cookie = {
        tokenName: cookie.tokenName,
        tokenString: cookie.tokenString,
        tokenExpiration: cookie.tokenExpiration
          ? new Date(cookie.tokenExpiration)
          : undefined,
        user: cookie.user,
        valid: true,
      }
    } else if (cookie?.tokenString && database?.status === 'emptyTokens') {
      console.log('Only loggedIn cookie token exists.')
      return { isValid, validTokens }
    } else if (database?.tokenString && !cookie?.tokenString) {
      console.log('Only loggedIn database token exists.')
      return { isValid, validTokens }
    } else if (!cookie?.tokenString && database?.status === 'emptyTokens') {
      console.log(
        'Both cookie and database tokens are null for loggedIn token.'
      )
    }
  }

  if (Object.keys(validTokens).length > 0) {
    isValid = true
  }

  console.log('Valid tokens in serverComponentsAuthUtility:', validTokens)
  return { isValid, validTokens }
}
