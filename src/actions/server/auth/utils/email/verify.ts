'use server';
import { session } from 'goobs-cache';

interface VerifyEmailOptions {
  email: string;
}

export async function verifyEmail(options: VerifyEmailOptions): Promise<boolean> {
  if (typeof options.email !== 'string' || options.email.trim() === '') {
    throw new Error('Invalid or missing email');
  }

  try {
    console.log('Verifying email code');

    // Create atoms for verification code and stored code
    const verificationCodeAtom = session.atom<string | undefined>(undefined);
    const storedCodeAtom = session.atom<string | undefined>(undefined);

    // Use atoms to get values
    const [verificationCode] = session.useAtom(verificationCodeAtom);
    const [storedCode] = session.useAtom(storedCodeAtom);

    // Get the verification code
    const code = await verificationCode;

    if (typeof code !== 'string' || code.trim() === '') {
      throw new Error('Invalid or missing verification code');
    }

    // Get the stored code
    const stored = await storedCode;

    if (stored && typeof stored === 'string' && stored === code) {
      // Code is valid, remove it from storage
      const [, setStoredCode] = session.useAtom(storedCodeAtom);
      await setStoredCode(undefined);

      console.log(`Email verification successful for ${options.email}`);
      return true;
    } else {
      console.log(`Email verification failed for ${options.email}`);
      return false;
    }
  } catch (error) {
    console.error('Error verifying email code:', error);
    throw error;
  }
}

export default verifyEmail;
