'use server'

import { cookies } from 'next/headers'

interface UpdateCookieOptions {
  cookie: {
    tokenName: string
    tokenString: string
    expiration?: Date
    update?: boolean
    valid?: boolean
    status?: string
  }
}

export default async function updateCookie(
  options: UpdateCookieOptions
): Promise<void> {
  console.log('Updating cookies with options:', options)

  const isDevelopment = process.env.NODE_ENV === 'development'
  const domain = isDevelopment ? 'localhost' : 'technologiesunlimited.net'
  const maxAge = 12 * 60 * 60
  const currentTimestamp = Date.now()

  const cookieOptions: {
    httpOnly: boolean
    sameSite: 'strict'
    maxAge: number
    path: '/'
    domain: string
    secure: boolean
    expires?: Date
  } = {
    httpOnly: true,
    sameSite: 'strict',
    maxAge,
    path: '/',
    domain,
    secure: true,
  }

  const cookie = options.cookie

  if (cookie.update || cookie.valid) {
    if (cookie.tokenName && cookie.tokenString) {
      const expiration =
        cookie.expiration || new Date(currentTimestamp + maxAge * 1000)
      cookieOptions.expires = expiration
      cookies().set(cookie.tokenName, cookie.tokenString, cookieOptions)
      console.log(`Cookie ${cookie.tokenName} set with expiration:`, expiration)
    }
  } else {
    if (cookie.tokenName) {
      cookies().delete(cookie.tokenName)
      console.log(`Cookie ${cookie.tokenName} deleted`)
    }
  }

  console.log('Cookie operation completed')
}
