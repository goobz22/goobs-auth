import { get } from 'goobs-cache'

/**
 * Represents the structure of a serializable token data.
 */
export interface SerializableTokenData {
  /** Optional unique identifier */
  _id?: string
  /** Name of the token */
  tokenName: string
  /** Token string value */
  tokenString: string
  /** Expiration date of the token */
  tokenExpiration: Date
  /** User associated with the token */
  user: string
}

/**
 * Represents the result of token validation.
 */
export interface ValidationResult {
  /** Token data */
  token?: Partial<SerializableTokenData>
  /** Cookie data with status */
  cookie?: Partial<SerializableTokenData> & {
    status:
      | 'valid'
      | 'onlyCookieToken'
      | 'cookieExpired'
      | 'invalid'
      | 'emptyTokens'
  }
  /** Database data with status */
  database?: Partial<SerializableTokenData> & {
    status:
      | 'valid'
      | 'onlyCookieToken'
      | 'cookieExpired'
      | 'invalid'
      | 'emptyTokens'
  }
}

/**
 * Represents an identifier object with string keys and optional string values.
 */
interface Identifier {
  [key: string]: string | undefined
}

/**
 * Compares a cookie token to its database counterpart.
 *
 * @param tokenName - The name of the token to compare
 * @param tokenData - The token data from the database, or null if not available
 * @returns An object containing the validation result, identifier, and the original token data
 */
export default async function compareCookietoDB(
  tokenName: string,
  tokenData: SerializableTokenData | null
): Promise<{
  validationResult: ValidationResult
  identifier: Identifier
  tokenData: SerializableTokenData | null
}> {
  // Retrieve the token from the client-side cache
  const result = await get(tokenName, 'cookie')
  const tokenString =
    typeof result?.value === 'string' ? result.value : undefined
  console.log(`Cookie Token (${tokenName}):`, tokenString)

  console.log('Token data received as prop:', tokenData)

  const validationResult: ValidationResult = {}

  console.log(`Validating ${tokenName} token...`)

  // Initialize validation result with available data
  validationResult.token = {
    tokenName,
    tokenString: tokenString || '',
    tokenExpiration: tokenData?.tokenExpiration,
    user: tokenData?.user || '',
  }
  validationResult.cookie = {
    tokenName,
    tokenString: tokenString || '',
    status: 'emptyTokens',
    user: tokenData?.user || '',
  }
  validationResult.database = {
    tokenName,
    tokenString: tokenData?.tokenString || '',
    tokenExpiration: tokenData?.tokenExpiration,
    status: 'emptyTokens',
    user: tokenData?.user || '',
  }

  // Perform token validation
  if (tokenData?.tokenExpiration && tokenData.tokenExpiration < new Date()) {
    console.log(`${tokenName} token is expired`)
    validationResult.cookie!.status = 'cookieExpired'
    validationResult.database!.status = 'cookieExpired'
  } else if (tokenString && !tokenData) {
    validationResult.cookie!.status = 'invalid'
    validationResult.database!.status = 'invalid'
  } else if (
    tokenString &&
    tokenData &&
    tokenData.tokenString === tokenString
  ) {
    validationResult.cookie!.status = 'valid'
    validationResult.database!.status = 'valid'
  } else {
    validationResult.cookie!.status =
      !tokenString && tokenData ? 'onlyCookieToken' : 'emptyTokens'
    validationResult.database!.status =
      !tokenString && tokenData ? 'onlyCookieToken' : 'emptyTokens'
  }

  console.log(`${tokenName} token validation result:`, validationResult)

  console.log('Preparing identifier...')
  const identifier: Identifier = {
    [tokenName]: validationResult.cookie?.tokenString,
  }
  console.log('Identifier:', identifier)

  console.log('Token validation completed in compareCookietoDB.')
  console.log('Validation Summary:')

  /**
   * Logs a summary of the validation results.
   *
   * @param name - The name of the token
   * @param cookie - The cookie validation result
   * @param database - The database validation result
   */
  const validationSummary = (
    name: string,
    cookie: Partial<SerializableTokenData> & {
      status:
        | 'valid'
        | 'onlyCookieToken'
        | 'cookieExpired'
        | 'invalid'
        | 'emptyTokens'
    },
    database: Partial<SerializableTokenData> & {
      status:
        | 'valid'
        | 'onlyCookieToken'
        | 'cookieExpired'
        | 'invalid'
        | 'emptyTokens'
    }
  ) => {
    if (cookie && database) {
      const { status: cookieStatus, tokenString: cookieToken } = cookie
      switch (cookieStatus) {
        case 'valid':
          console.log(`Valid Token Comparison for ${name}: ${cookieToken}`)
          break
        case 'onlyCookieToken':
          console.log(
            `Only Cookie Token Exists for ${name}: ${JSON.stringify(cookie)}`
          )
          break
        case 'cookieExpired':
          console.log(
            `Expired Cookie Token for ${name}: ${JSON.stringify(cookie)}`
          )
          break
        case 'invalid':
          console.log(
            `Invalid Token Combination for ${name}: ${JSON.stringify({ cookie, database })}`
          )
          break
        case 'emptyTokens':
          console.log(`Both Cookie and Database Tokens are Null for ${name}`)
          break
      }
    }
  }

  // Log validation summary if both cookie and database results are available
  if (validationResult.cookie && validationResult.database) {
    validationSummary(
      tokenName,
      validationResult.cookie,
      validationResult.database
    )
  }

  return {
    validationResult,
    identifier,
    tokenData,
  }
}
