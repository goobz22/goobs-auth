import { authenticator } from 'otplib';
import QRCode from 'qrcode';

interface MFAQRCodeResult {
  secret: string;
  qrCodeDataURL: string;
}

export interface MFAQRCodeOptions {
  qrCodeOptions?: QRCode.QRCodeToDataURLOptions;
  authenticatorOptions?: {
    digits?: number;
    step?: number;
  };
}

/**
 * Generates a secret key and QR code for MFA setup.
 *
 * @param username - The username or identifier for the user.
 * @param appName - The name of the application for MFA.
 * @param options - Additional options for QR code and authenticator.
 * @returns A promise that resolves to an object containing the secret and QR code data URL.
 * @throws Error if inputs are invalid or QR code generation fails.
 */
export async function generateMFAQRCode(
  username: string,
  appName: string,
  options: MFAQRCodeOptions = {},
): Promise<MFAQRCodeResult> {
  // Input validation
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid username');
  }
  if (!appName || typeof appName !== 'string') {
    throw new Error('Invalid appName');
  }

  // Configure authenticator
  if (options.authenticatorOptions) {
    authenticator.options = {
      ...authenticator.options,
      ...options.authenticatorOptions,
    };
  }

  // Generate a secret key
  const secret = authenticator.generateSecret();

  // Create the OTP authentication URL
  const otpAuth = authenticator.keyuri(
    encodeURIComponent(username),
    encodeURIComponent(appName),
    secret,
  );

  try {
    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(otpAuth, options.qrCodeOptions);

    return {
      secret,
      qrCodeDataURL,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Verifies a MFA token against a secret.
 *
 * @param token - The token to verify.
 * @param secret - The secret key to verify against.
 * @returns A boolean indicating whether the token is valid.
 * @throws Error if inputs are invalid.
 */
export function verifyMFAToken(token: string, secret: string): boolean {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token');
  }
  if (!secret || typeof secret !== 'string') {
    throw new Error('Invalid secret');
  }

  return authenticator.verify({ token, secret });
}

export default generateMFAQRCode;
