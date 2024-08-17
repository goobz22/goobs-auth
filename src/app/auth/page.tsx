'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { CircularProgress } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { PopupForm, PopupFormProps } from 'goobs-frontend';
import loadAuthConfig, { AuthConfig } from '../../actions/server/auth/configLoader';

/** Type definition for authentication modes. */
type AuthMode = 'login' | 'registration' | 'forgotPassword';

// Lazy load the step components
const EnterEmailStep = lazy(() => import('./AuthSteps/passwordlessLogin'));
const EmailPasswordVerificationStep = lazy(() => import('./AuthSteps/signup'));
const VerificationStep = lazy(() => import('./AuthSteps/verification'));
const AccountInfoStep = lazy(() => import('./AuthSteps/accountInformation'));

/**
 * AuthPageInner component handles the authentication process.
 * It manages the state of the authentication flow and renders the appropriate step components.
 *
 * @returns {React.FC} The AuthPageInner component
 */
const AuthPageInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await loadAuthConfig();
        setAuthConfig(config);
        const mode = searchParams.get('mode') as AuthMode;
        if (mode && ['login', 'registration', 'forgotPassword'].includes(mode)) {
          setAuthMode(mode);
        } else {
          setAuthMode('login');
        }
      } catch (err) {
        console.error('Failed to load auth config:', err);
      }
    };

    loadConfig();
  }, [searchParams]);

  if (!authConfig) return null;

  const currentSteps = authConfig.authentication[authMode];
  const currentStepConfig = currentSteps[currentStep - 1];

  const handleSubmit = async () => {
    if (currentStep < currentSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Final step reached. Ready to submit all data.');
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If we're at the first step, we might want to reset the auth mode or redirect
      setAuthMode('login');
      router.push('/auth');
    }
  };

  const handleVerification = async () => {
    try {
      // Verification logic will be handled in the VerificationStep component
      console.log('Verification initiated');
    } catch (error) {
      console.error('Error in verification process:', error);
    }
  };

  const handleResend = async () => {
    try {
      // Resend logic will be handled in the VerificationStep component
      console.log('Verification resend initiated');
    } catch (error) {
      console.error('Error in resend process:', error);
    }
  };

  const renderAuthStep = () => {
    switch (currentStepConfig.type) {
      case 'enterEmail':
        return (
          <Suspense fallback={<CircularProgress />}>
            <EnterEmailStep onSubmit={handleSubmit} />
          </Suspense>
        );
      case 'emailAndPasswordVerification':
      case 'emailAndPasswordAndVerifyPasswordVerification':
        return (
          <Suspense fallback={<CircularProgress />}>
            <EmailPasswordVerificationStep
              onSubmit={handleSubmit}
              isRegistration={
                currentStepConfig.type === 'emailAndPasswordAndVerifyPasswordVerification'
              }
            />
          </Suspense>
        );
      case 'emailVerification':
      case 'textMessageVerification':
        return (
          <Suspense fallback={<CircularProgress />}>
            <VerificationStep
              onVerify={handleVerification}
              onResend={handleResend}
              onBack={handleBack}
              onContinue={handleSubmit}
              verificationMethod={currentStepConfig.type === 'emailVerification' ? 'email' : 'sms'}
            />
          </Suspense>
        );
      case 'accountInfo':
        return (
          <Suspense fallback={<CircularProgress />}>
            <AccountInfoStep onSubmit={handleSubmit} onBack={handleBack} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const generatePopupFormProps = (): PopupFormProps => ({
    title:
      authMode === 'login'
        ? 'Login'
        : authMode === 'registration'
          ? 'Registration'
          : 'Reset your password',
    description:
      authMode === 'login'
        ? 'Login to continue to the application'
        : authMode === 'registration'
          ? 'Create your account to get started'
          : 'Type in your email to start recovery',
    popupType: 'modal',
    content: renderAuthStep(),
  });

  return <PopupForm {...generatePopupFormProps()} />;
};

/**
 * AuthPageContent component wraps the AuthPageInner component with Suspense for code splitting.
 *
 * @returns {React.FC} The AuthPageContent component
 */
const AuthPageContent: React.FC = () => {
  return (
    <Suspense fallback={<CircularProgress aria-label="Loading authentication page" />}>
      <AuthPageInner />
    </Suspense>
  );
};

export default AuthPageContent;
