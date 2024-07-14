import { set } from 'goobs-cache'

/**
 * Options for updating a cookie.
 */
interface UpdateCookieOptions {
  /** Cookie data */
  cookie: {
    /** Name of the token/cookie */
    tokenName: string
    /** Token string value */
    tokenString: string
    /** Expiration date of the cookie */
    expiration?: Date
    /** Flag to indicate if the cookie should be updated */
    update?: boolean
    /** Flag to indicate if the cookie is valid */
    valid?: boolean
    /** Status of the cookie */
    status?: string
  }
}

/**
 * Updates or deletes a cookie in the client-side cache.
 *
 * @param options - The options for updating the cookie
 * @returns A promise that resolves when the cookie operation is completed
 */
export default async function updateCookie(
  options: UpdateCookieOptions
): Promise<void> {
  console.log('Updating cookies with options:', options)

  // Define maximum age for the cookie (12 hours in seconds)
  const maxAge = 12 * 60 * 60
  const currentTimestamp = Date.now()
  const cookie = options.cookie

  if (cookie.update || cookie.valid) {
    // Update or set the cookie
    if (cookie.tokenName && cookie.tokenString) {
      const expiration =
        cookie.expiration || new Date(currentTimestamp + maxAge * 1000)

      // Set the cookie in the client-side cache
      await set(
        cookie.tokenName,
        {
          type: 'string',
          value: cookie.tokenString,
        },
        expiration,
        'client'
      )
      console.log(`Cookie ${cookie.tokenName} set with expiration:`, expiration)
    }
  } else {
    // Delete the cookie
    if (cookie.tokenName) {
      // To simulate deletion, we set an expired cookie
      await set(
        cookie.tokenName,
        {
          type: 'string',
          value: '',
        },
        new Date(0),
        'cookie'
      )
      console.log(`Cookie ${cookie.tokenName} deleted (set to expire)`)
    }
  }

  console.log('Cookie operation completed')
}
