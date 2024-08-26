// File: src\app\auth\login\text-verification\page.tsx
'use client';
import React from 'react';
import VerificationStep from '../../verification';

const TextVerificationPage: React.FC = () => {
  const handleVerify = () => {
    // Handle verification logic
    console.log('Verifying SMS code');
  };

  const handleResend = () => {
    // Handle resend logic
    console.log('Resending SMS code');
  };

  const handleBack = () => {
    // Handle back button logic
    console.log('Going back');
  };

  const handleContinue = () => {
    // Handle continue button logic
    console.log('Continuing to next step');
  };

  return (
    <VerificationStep
      onVerify={handleVerify}
      onResend={handleResend}
      onBack={handleBack}
      onContinue={handleContinue}
      verificationMethod="sms"
    />
  );
};

export default TextVerificationPage;
