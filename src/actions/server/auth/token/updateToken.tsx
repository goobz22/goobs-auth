'use server'

import crypto from 'crypto'

export interface SerializableTokenData {
  _id?: string
  tokenName: string
  tokenString: string
  tokenExpiration: string
  user: string
}

export default async function updateToken(
  options: Partial<SerializableTokenData>
): Promise<SerializableTokenData> {
  console.log('Starting the token update process.')
  console.log('Received options:', options)

  const generateSecureToken = (): string => {
    const tokenLength = 32
    const tokenBytes = crypto.randomBytes(tokenLength)
    return tokenBytes.toString('hex')
  }

  const getExpirationDate = (expiration?: string): string => {
    return (
      expiration || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    )
  }

  let tokenData: SerializableTokenData = {
    tokenName: options.tokenName || '',
    tokenString: options.tokenString || '',
    tokenExpiration: getExpirationDate(options.tokenExpiration),
    user: options.user || crypto.randomUUID(),
  }

  if (options.tokenName && !options.tokenString) {
    console.log('Token update requested.')
    const tokenName = options.tokenName
    const token = generateSecureToken()
    const expirationDate = getExpirationDate(options.tokenExpiration)

    tokenData = {
      ...tokenData,
      tokenName: tokenName,
      tokenString: token,
      tokenExpiration: expirationDate,
    }

    console.log(`Updated ${tokenName} token in tokenData:`, tokenData)
  } else if (!options.tokenName) {
    console.log('Token name not provided. No update performed.')
  } else {
    console.log(
      'Token update not requested or tokenString provided. Using provided data.'
    )
  }

  return tokenData
}
