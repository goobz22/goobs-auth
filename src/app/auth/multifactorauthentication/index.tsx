'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { PopupForm, ExtendedButtonProps, ExtendedQRCodeProps } from 'goobs-frontend';
import { useAuth } from '../../../actions/server/auth/authContext';
import { useRouter } from 'next/navigation';
import { generateMFAQRCode, MFAQRCodeOptions } from '../../../actions/server/auth/utils/generateMFAQRCode';

interface MFASetupProps {
  showHelperFooter?: boolean;
}

const MFASetup: React.FC<MFASetupProps> = () => {
  console.log('MFASetup: Component rendering');
  const { getAuthData, setAuthData } = useAuth();
  const router = useRouter();
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupMFA = async () => {
      const authData = getAuthData();
      if (authData.email) {
        try {
          const options: MFAQRCodeOptions = {
            qrCodeOptions: { width: 200 },
            authenticatorOptions: { digits: 6, step: 30 }
          };
          const { secret, qrCodeDataURL } = await generateMFAQRCode(authData.email, 'YourAppName', options);
          setQRCodeData(qrCodeDataURL);
          setSecret(secret);
        } catch (error) {
          console.error('Failed to generate MFA QR code:', error);
          setError(error instanceof Error ? error.message : 'An unknown error occurred');
        }
      } else {
        setError('User email not found in auth data');
      }
    };
    setupMFA();
  }, [getAuthData]);

  const qrCodeProps = useMemo<ExtendedQRCodeProps[]>(
    () => [
      {
        value: qrCodeData || '',
        size: 200,
        title: 'Scan this QR code with your authenticator app',
        columnconfig: {
          row: 1,
          column: 1,
          alignment: 'center' as const,
          columnwidth: '100%',
        },
      },
    ],
    [qrCodeData]
  );

  const buttonProps = useMemo<ExtendedButtonProps[]>(() => {
    const handleContinue = () => {
      console.log('MFASetup: Continue button clicked');
      setAuthData((prevData) => ({ ...prevData, mfaSecret: secret }));
      console.log('MFASetup: Attempting to navigate to MFA verification');
      router.push('/auth/multifactorauthentication/verify');
    };
    return [
      {
        text: 'Continue',
        fontcolor: 'white',
        variant: 'contained',
        backgroundcolor: 'black',
        width: '100%',
        fontvariant: 'merriparagraph' as const,
        columnconfig: {
          row: 2,
          column: 1,
          margintop: 2,
          alignment: 'center' as const,
          columnwidth: '100%',
        },
        name: 'continue',
        'aria-label': 'Continue to MFA verification',
        type: 'button',
        onClick: handleContinue,
        disableButton: !qrCodeData || !!error ? 'true' : 'false',
      },
    ];
  }, [router, setAuthData, secret, qrCodeData, error]);

  console.log('MFASetup: Rendering form');
  return (
    <PopupForm
      title="Set Up Multi-Factor Authentication"
      description={error || "Scan the QR code below with your authenticator app (e.g., Google Authenticator, Microsoft Authenticator). After scanning, click 'Continue' to proceed to the verification step."}
      grids={[
        {
          grid: {
            gridconfig: {
              alignment: 'center',
              gridwidth: '100%',
            },
          },
          qrcode: qrCodeData ? qrCodeProps : undefined,
        },
        {
          grid: {
            gridconfig: {
              alignment: 'center',
              gridwidth: '100%',
            },
          },
          button: buttonProps,
        },
      ]}
      popupType="modal"
      width={450}
    />
  );
};

MFASetup.displayName = 'MFASetup';
export default MFASetup;