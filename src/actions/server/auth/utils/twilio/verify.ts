'use server';
import { session } from 'goobs-cache';

interface UserData {
  phoneNumber: string;
}

const verifyUser = async (phoneNumber: UserData['phoneNumber']): Promise<boolean> => {
  if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    throw new Error('Invalid or missing phone number');
  }

  try {
    console.log('Verifying code');

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

      console.log(`Verification successful for ${phoneNumber}`);
      return true;
    } else {
      console.log(`Verification failed for ${phoneNumber}`);
      return false;
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

export default verifyUser;
