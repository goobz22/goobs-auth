import { NextRequest, NextResponse } from 'next/server'
import authUtility from './authUtility'

/**
 * Custom authentication middleware.
 *
 * This middleware uses authUtility to check for a valid 'loggedIn' token
 * and redirects to '/auth/login' if the token is invalid or missing.
 * It passes the valid token data to the next middleware or route handler.
 *
 * @param request - The incoming request object
 * @returns A Promise resolving to the next response with token data or a redirect response
 */
export async function authMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const tokenName = 'loggedIn'
    const tokenData = request.cookies.get(tokenName)?.value

    const result = await authUtility({
      mode: 'validate',
      tokenData: tokenData ? JSON.parse(tokenData) : null,
      tokenName,
    })

    if ('isValid' in result && !result.isValid) {
      // If the token is invalid, redirect to the login page
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If the token is valid, we'll pass the token data to the next middleware or route handler
    const response = NextResponse.next()

    if ('validationResult' in result && result.validationResult.token) {
      // You might want to consider encrypting this data for additional security
      response.headers.set(
        'X-Auth-Token',
        JSON.stringify(result.validationResult.token)
      )
    }

    return response
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Handle any unexpected errors by redirecting to the login page
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}
