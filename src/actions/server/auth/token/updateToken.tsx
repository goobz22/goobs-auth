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
    const token = tokenBytes.toString('hex')
    console.log('Generated secure token:', token)
    return token
  }

  let tokenData: SerializableTokenData = {
    tokenName: options.tokenName || '',
    tokenString: options.tokenString || '',
    tokenExpiration:
      options.tokenExpiration ||
      new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    user: options.user || crypto.randomUUID(), // Using UUID instead of ObjectId
  }

  console.log('Created token data:', tokenData)

  if (options.tokenName && !options.tokenString) {
    console.log('Token update requested.')
    const tokenName = options.tokenName
    console.log('Processing token name:', tokenName)
    const token = generateSecureToken()
    console.log(`Generated new ${tokenName} token:`, token)
    const expirationDate =
      options.tokenExpiration ||
      new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    console.log(`Set ${tokenName} token expiration:`, expirationDate)
    tokenData = {
      ...tokenData,
      tokenName: tokenName,
      tokenString: token,
      tokenExpiration: expirationDate,
    }
    console.log(`Updated ${tokenName} token in tokenData:`, tokenData)
    console.log('Token update process completed.')
  } else {
    console.log(
      'Token update not requested or tokenString provided. Using provided data.'
    )
  }

  console.log('Returning tokenData:', tokenData)
  return tokenData
}
