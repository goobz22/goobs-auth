'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { CircularProgress } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { PopupForm, PopupFormProps } from 'goobs-frontend';
import loadAuthConfig, { AuthConfig } from '../../actions/server/auth/configLoader';
import { verifyEmail } from '../../actions/server/email/verify';
import { sendEmail } from '../../actions/server/email/send';
import sendSMS from '../../actions/server/twilio/send';
import verifyUser from '../../actions/server/twilio/verify';

/** Type definition for authentication modes. */
type AuthMode = 'login' | 'registration' | 'forgotPassword';

// Lazy load the step components
const EnterEmailStep = lazy(() => import('./AuthSteps/EnterEmailStep'));
const EmailPasswordVerificationStep = lazy(
  () => import('./AuthSteps/EmailPasswordVerificationStep'),
);
const EmailVerificationStep = lazy(() => import('./AuthSteps/EmailVerificationStep'));
const TextMessageVerificationStep = lazy(() => import('./AuthSteps/TextMessageVerificationStep'));
const AccountInfoStep = lazy(() => import('./AuthSteps/AccountInfoStep'));

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
  const [isVerificationCodeValid, setIsVerificationCodeValid] = useState(false);
  const [email] = useState('');

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

  const handleEmailVerification = async () => {
    try {
      const isValid = await verifyEmail({ email });
      if (isValid) {
        console.log('Email verification successful');
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Email verification failed');
        setIsVerificationCodeValid(false);
      }
    } catch (error) {
      console.error('Error verifying email:', error);
    }
  };

  const handleResendEmail = async () => {
    try {
      await sendEmail({
        to: email,
        subject: 'Verification Code',
        html: 'Your verification code is: ',
      });
      console.log('Verification email resent successfully');
    } catch (error) {
      console.error('Error resending verification email:', error);
    }
  };

  const handlePhoneVerification = async () => {
    try {
      const phoneNumber = ''; // Retrieve phone number from form data in child component
      const isValid = await verifyUser(phoneNumber);
      if (isValid) {
        console.log('Phone number verification successful');
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Phone number verification failed');
        setIsVerificationCodeValid(false);
      }
    } catch (error) {
      console.error('Error verifying phone number:', error);
    }
  };

  const handleResendSMS = async () => {
    try {
      const phoneNumber = ''; // Retrieve phone number from form data in child component
      await sendSMS(phoneNumber);
      console.log('Verification code resent successfully');
    } catch (error) {
      console.error('Error resending verification code:', error);
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
        return (
          <Suspense fallback={<CircularProgress />}>
            <EmailVerificationStep
              onVerify={handleEmailVerification}
              onResend={handleResendEmail}
              isValid={isVerificationCodeValid}
              onBack={handleBack}
              onContinue={handleSubmit}
              email={email}
            />
          </Suspense>
        );
      case 'textMessageVerification':
        return (
          <Suspense fallback={<CircularProgress />}>
            <TextMessageVerificationStep
              onVerify={handlePhoneVerification}
              onResend={handleResendSMS}
              isValid={isVerificationCodeValid}
              onBack={handleBack}
              onContinue={handleSubmit}
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
