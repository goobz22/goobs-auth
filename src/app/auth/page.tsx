'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { CircularProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';

/** Type definition for authentication modes. */
type AuthMode = 'login' | 'registration' | 'forgotPassword';

// Define a type for the step configurations
type StepConfig =
  | 'login'
  | 'signup'
  | 'loginTextVerification'
  | 'signupTextVerification'
  | 'forgotPasswordTextVerification'
  | 'accountInfo'
  | 'forgotPassword';

// Lazy load the step components
const LoginStep = lazy(() => import('./login'));
const SignupStep = lazy(() => import('./signup'));
const LoginTextVerificationStep = lazy(() => import('./login/text-verification'));
const SignupTextVerificationStep = lazy(() => import('./signup/text-verification'));
const ForgotPasswordTextVerificationStep = lazy(
  () => import('./forgot-password/text-verification'),
);
const AccountInfoStep = lazy(() => import('./signup/accountInformation'));
const ForgotPasswordStep = lazy(() => import('./forgot-password'));

/**
 * AuthPageInner component handles the authentication process.
 * It manages the state of the authentication flow and renders the appropriate step components.
 *
 * @returns {React.FC} The AuthPageInner component
 */
const AuthPageInner: React.FC = () => {
  console.log('AuthPageInner: Component rendering');
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [currentStep, setCurrentStep] = useState<StepConfig>('login');

  useEffect(() => {
    console.log('AuthPageInner: useEffect triggered');
    const mode = searchParams.get('mode') as AuthMode;
    const step = searchParams.get('step') as StepConfig;

    console.log('AuthPageInner: Current URL parameters:', { mode, step });

    if (mode && ['login', 'registration', 'forgotPassword'].includes(mode)) {
      console.log(`AuthPageInner: Setting authMode to ${mode}`);
      setAuthMode(mode);
    } else {
      console.log('AuthPageInner: Setting default authMode to login');
      setAuthMode('login');
    }

    if (
      step &&
      [
        'login',
        'signup',
        'loginTextVerification',
        'signupTextVerification',
        'forgotPasswordTextVerification',
        'accountInfo',
        'forgotPassword',
      ].includes(step)
    ) {
      console.log(`AuthPageInner: Setting currentStep to ${step}`);
      setCurrentStep(step);
    } else {
      console.log('AuthPageInner: Determining default step based on mode');
      switch (mode) {
        case 'registration':
          console.log('AuthPageInner: Setting default step to signup for registration mode');
          setCurrentStep('signup');
          break;
        case 'forgotPassword':
          console.log(
            'AuthPageInner: Setting default step to forgotPassword for forgotPassword mode',
          );
          setCurrentStep('forgotPassword');
          break;
        default:
          console.log('AuthPageInner: Setting default step to login');
          setCurrentStep('login');
      }
    }
  }, [searchParams]);

  const renderAuthStep = () => {
    console.log(`AuthPageInner: renderAuthStep called for currentStep: ${currentStep}`);
    switch (currentStep) {
      case 'login':
        console.log('AuthPageInner: Rendering LoginStep');
        return (
          <Suspense fallback={<CircularProgress />}>
            <LoginStep />
          </Suspense>
        );
      case 'signup':
        console.log('AuthPageInner: Rendering SignupStep');
        return (
          <Suspense fallback={<CircularProgress />}>
            <SignupStep />
          </Suspense>
        );
      case 'loginTextVerification':
        console.log('AuthPageInner: Rendering LoginTextVerificationStep');
        return (
          <Suspense fallback={<CircularProgress />}>
            <LoginTextVerificationStep />
          </Suspense>
        );
      case 'signupTextVerification':
        console.log('AuthPageInner: Rendering SignupTextVerificationStep');
        return (
          <Suspense fallback={<CircularProgress />}>
            <SignupTextVerificationStep />
          </Suspense>
        );
      case 'forgotPasswordTextVerification':
        console.log('AuthPageInner: Rendering ForgotPasswordTextVerificationStep');
        return (
          <Suspense fallback={<CircularProgress />}>
            <ForgotPasswordTextVerificationStep />
          </Suspense>
        );
      case 'accountInfo':
        console.log('AuthPageInner: Rendering AccountInfoStep');
        return (
          <Suspense fallback={<CircularProgress />}>
            <AccountInfoStep />
          </Suspense>
        );
      case 'forgotPassword':
        console.log('AuthPageInner: Rendering ForgotPasswordStep');
        return (
          <Suspense fallback={<CircularProgress />}>
            <ForgotPasswordStep />
          </Suspense>
        );
      default:
        console.log('AuthPageInner: No matching step found, returning null');
        return null;
    }
  };

  console.log(`AuthPageInner: Current state - authMode: ${authMode}, currentStep: ${currentStep}`);
  return renderAuthStep();
};

/**
 * AuthPageContent component wraps the AuthPageInner component with Suspense for code splitting.
 *
 * @returns {React.FC} The AuthPageContent component
 */
const AuthPageContent: React.FC = () => {
  console.log('AuthPageContent: Rendering');
  return (
    <Suspense fallback={<CircularProgress aria-label="Loading authentication page" />}>
      <AuthPageInner />
    </Suspense>
  );
};

export default AuthPageContent;
