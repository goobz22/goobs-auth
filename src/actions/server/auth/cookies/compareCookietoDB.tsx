'use server'

import { cookies } from 'next/headers'

export interface SerializableTokenData {
  _id?: string
  tokenName: string
  tokenString: string
  tokenExpiration: Date
  user: string
}

interface ValidationResult {
  token?: Partial<TokenData>
  cookie?: Partial<TokenData> & {
    status:
      | 'valid'
      | 'onlyCookieToken'
      | 'cookieExpired'
      | 'invalid'
      | 'emptyTokens'
  }
  database?: Partial<TokenData> & {
    status:
      | 'valid'
      | 'onlyCookieToken'
      | 'cookieExpired'
      | 'invalid'
      | 'emptyTokens'
  }
}

interface TokenData extends SerializableTokenData {
  tokenName: string
}

interface Identifier {
  [key: string]: string | undefined
}

export default async function compareCookietoDB(
  tokenName: string,
  tokenData: SerializableTokenData | null
): Promise<{
  validationResult: ValidationResult
  identifier: Identifier
}> {
  const tokenString = cookies().get(tokenName)?.value
  console.log(`Cookie Token (${tokenName}):`, tokenString)

  console.log('Token data received as prop:', tokenData)

  const validationResult: ValidationResult = {}

  console.log(`Validating ${tokenName} token...`)
  validationResult.token = {
    tokenName,
    tokenString: tokenString || '',
    tokenExpiration: tokenData?.tokenExpiration,
    user: tokenData?.user || '',
  }
  validationResult.cookie = {
    tokenName,
    tokenString: tokenString || '',
    tokenExpiration: undefined,
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

  if (
    tokenData?.tokenExpiration &&
    new Date(tokenData.tokenExpiration) < new Date()
  ) {
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

  const validationSummary = (
    name: string,
    cookie: Partial<TokenData> & {
      status:
        | 'valid'
        | 'onlyCookieToken'
        | 'cookieExpired'
        | 'invalid'
        | 'emptyTokens'
    },
    database: Partial<TokenData> & {
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
  }
}
