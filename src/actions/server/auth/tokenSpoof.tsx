'use server'

export interface SerializableTokenData {
  _id?: string
  tokenName: string
  tokenString: string
  tokenExpiration: string
  user: string
}
interface ValidTokens {
  token?: Partial<SerializableTokenData>
  cookie?: Partial<SerializableTokenData> & {
    valid: boolean
  }
}

interface AuthSpoofOptions {
  tokenName?: string
  tokenString?: string
  tokenExpiration?: Date
}

export default async function authSpoof(options?: AuthSpoofOptions): Promise<{
  isValid: boolean
  validTokens: ValidTokens
}> {
  const {
    tokenName = 'loggedInToken',
    tokenString = 'mockTokenString',
    tokenExpiration = new Date(Date.now() + 3600000), // Expires in 1 hour
  } = options || {}

  // Create a mock user ID
  const mockUserId = Math.random().toString(36).substring(2, 15)

  // Create mock token data
  const mockTokenData: Partial<SerializableTokenData> = {
    tokenName,
    tokenString,
    tokenExpiration: tokenExpiration.toISOString(),
    user: mockUserId,
  }

  // Create mock valid tokens
  const validTokens: ValidTokens = {
    token: mockTokenData,
    cookie: {
      ...mockTokenData,
      valid: true,
    },
  }

  return {
    isValid: true,
    validTokens,
  }
}
