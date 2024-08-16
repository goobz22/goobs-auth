import { NextRequest, NextResponse } from 'next/server';
import authUtility, { ValidateResult } from './authUtility';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import winston from 'winston';
import { ServerEncryptionModule } from 'goobs-encryption';
import type { EncryptionConfig, GlobalConfig } from 'goobs-encryption';

// Configure logger
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}] : ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
      }
      return msg;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'auth-middleware.log' }),
  ],
});

// Configure rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
});

// Environment-based configuration
const LOGIN_PATH = process.env.LOGIN_REDIRECT_PATH || '/auth/login';
const SESSION_EXPIRED_PATH = process.env.SESSION_EXPIRED_PATH || '/auth/session-expired';
const INVALID_SESSION_PATH = process.env.INVALID_SESSION_PATH || '/auth/invalid-session';
const TOKEN_EXPIRATION_TIME = parseInt(process.env.TOKEN_EXPIRATION_TIME || '3600', 10); // Default to 1 hour

// Configure goobs-encryption
const encryptionConfig: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  encryptionPassword: process.env.ENCRYPTION_PASSWORD || 'default-secure-password',
  keyCheckIntervalMs: 3600000, // 1 hour
  keyRotationIntervalMs: 86400000, // 24 hours
};

const globalConfig: GlobalConfig = {
  loggingEnabled: true,
  logLevel: 'info',
  logDirectory: './logs',
};

// Initialize ServerEncryptionModule
ServerEncryptionModule.initialize(encryptionConfig, globalConfig)
  .then(() => logger.info('ServerEncryptionModule initialized successfully'))
  .catch((error) => logger.error('Failed to initialize ServerEncryptionModule', { error }));

/**
 * Custom authentication middleware.
 *
 * This middleware uses authUtility to check for a valid 'loggedIn' token
 * and redirects to the login page if the token is invalid or missing.
 * It passes the valid token data to the next middleware or route handler.
 *
 * @param request - The incoming request object
 * @returns A Promise resolving to the next response with token data or a redirect response
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const tokenName = 'loggedIn';
  const tokenData = request.cookies.get(tokenName)?.value;

  const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  logger.debug('Starting auth middleware', {
    url: request.url,
    method: request.method,
    ip: clientIp,
    hasToken: !!tokenData,
  });

  try {
    // Rate limiting
    logger.debug('Checking rate limit', { ip: clientIp });
    await rateLimiter.consume(clientIp);
    logger.debug('Rate limit check passed', { ip: clientIp });

    let decryptedTokenData = null;
    if (tokenData) {
      try {
        logger.debug('Decrypting token data');
        const decryptedValue = await ServerEncryptionModule.decrypt(JSON.parse(tokenData));
        decryptedTokenData = JSON.parse(new TextDecoder().decode(decryptedValue));
        logger.debug('Token data decrypted successfully');
      } catch (decryptError) {
        logger.error('Failed to decrypt token', { error: decryptError });
        return NextResponse.redirect(new URL(INVALID_SESSION_PATH, request.url));
      }
    }

    logger.debug('Validating token with authUtility');
    const result = (await authUtility({
      mode: 'validate',
      tokenData: decryptedTokenData,
      tokenName,
    })) as ValidateResult;

    logger.debug('Token validation result', { isValid: result.isValid });

    if (!result.isValid) {
      logger.info('Invalid token, redirecting to login', { tokenName });
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }

    // Check token expiration
    const tokenExpiration = result.validationResult.token?.tokenExpiration;
    if (tokenExpiration && new Date(tokenExpiration) < new Date()) {
      logger.info('Token expired, redirecting to session expired page', {
        tokenName,
        tokenExpiration,
      });
      return NextResponse.redirect(new URL(SESSION_EXPIRED_PATH, request.url));
    }

    logger.debug('Token is valid, preparing response');

    // If the token is valid, we'll pass the token data to the next middleware or route handler
    const response = NextResponse.next();

    if (result.validationResult.token) {
      logger.debug('Encrypting token for X-Auth-Token header');
      const encryptedToken = await ServerEncryptionModule.encrypt(
        new TextEncoder().encode(JSON.stringify(result.validationResult.token)),
      );
      response.headers.set('X-Auth-Token', JSON.stringify(encryptedToken));
    }

    // Update the cookie with a new expiration time
    if (result.validationResult.cookie?.tokenString) {
      logger.debug('Updating cookie with new expiration time');
      const updatedCookie = {
        ...result.validationResult.cookie,
        expirationDate: new Date(Date.now() + TOKEN_EXPIRATION_TIME * 1000).toISOString(),
      };
      const encryptedCookie = await ServerEncryptionModule.encrypt(
        new TextEncoder().encode(JSON.stringify(updatedCookie)),
      );

      response.cookies.set(tokenName, JSON.stringify(encryptedCookie), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: TOKEN_EXPIRATION_TIME,
      });
    }

    logger.info('Authentication successful', { tokenName });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Auth middleware error', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error('Unknown auth middleware error', { error });
    }

    // Handle rate limit error
    if (error instanceof Error && error.name === 'RateLimiterRes') {
      logger.warn('Rate limit exceeded', { ip: clientIp });
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    // For any other errors, redirect to the login page
    logger.error('Unexpected error, redirecting to login page');
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }
}

export default authMiddleware;
