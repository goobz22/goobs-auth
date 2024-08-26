'use client';

import React, { useMemo } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { PopupForm, ExtendedButtonProps, ExtendedTextFieldProps } from 'goobs-frontend';
import { useAuth } from '../../../actions/server/auth/authContext';
import { useRouter } from 'next/navigation';

interface ForgotPasswordProps {
  onSubmit: (email: string) => void;
}

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSubmit }) => {
  console.log('ForgotPassword: Component rendering');
  const { setAuthData } = useAuth();
  const router = useRouter();

  const handleSubmit = (values: { email: string }) => {
    console.log('ForgotPassword: handleSubmit called');
    console.log('ForgotPassword: Form submitted with email:', values.email);
    setAuthData({ email: values.email });
    onSubmit(values.email);
    console.log('ForgotPassword: Attempting to navigate to forgot password text verification');
    router.push('/auth?mode=forgotPassword&step=forgotPasswordTextVerification');
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  const textFieldProps = useMemo<ExtendedTextFieldProps[]>(
    () => [
      {
        name: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        error: formik.touched.email && Boolean(formik.errors.email),
        helperText: formik.touched.email && formik.errors.email ? formik.errors.email : '',
        required: true,
        columnconfig: {
          row: 1,
          column: 1,
          alignment: 'left' as const,
          columnwidth: '100%',
        },
        InputProps: {
          'aria-label': 'Enter your email address',
        },
        value: formik.values.email,
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
      },
    ],
    [formik], // Added formik to the dependency array
  );

  const buttonProps = useMemo<ExtendedButtonProps[]>(
    () => [
      {
        text: 'Reset Password',
        fontcolor: 'white',
        variant: 'contained',
        backgroundcolor: 'black',
        width: '100%',
        fontvariant: 'merriparagraph' as const,
        columnconfig: {
          row: 1,
          column: 2,
          margintop: 1,
          alignment: 'center' as const,
          columnwidth: '33.3%',
        },
        name: 'submit',
        'aria-label': 'Continue to text verification to reset',
        type: 'button',
        requiredHelperFooterMessage: 'Please fill in required fields',
        disableButton: formik.isSubmitting || !formik.isValid ? 'true' : 'false',
        onClick: () => {
          console.log('ForgotPassword: Reset Password button clicked');
          formik.handleSubmit();
        },
      },
    ],
    [formik], // Added formik to the dependency array
  );

  const linkProps = useMemo(
    () => [
      {
        link: '/auth',
        text: 'Back to Login',
        fontcolor: 'marine.main',
        fontvariant: 'merriparagraph' as const,
        columnconfig: {
          row: 1,
          column: 1,
          alignment: 'left' as const,
          columnwidth: '33.3%',
          margintop: 1,
        },
      },
      {
        link: '/auth?mode=registration',
        text: 'Register Instead',
        fontcolor: 'marine.main',
        fontvariant: 'merriparagraph' as const,
        columnconfig: {
          row: 1,
          column: 3,
          alignment: 'right' as const,
          columnwidth: '33.3%',
          margintop: 1,
        },
      },
    ],
    [], // This useMemo doesn't depend on any variables, so the dependency array remains empty
  );

  console.log('ForgotPassword: Rendering form');
  return (
    <PopupForm
      title="Forgot Password"
      description="Enter your email to reset your password"
      grids={[
        {
          grid: {
            gridconfig: {
              alignment: 'left',
              gridwidth: '100%',
            },
          },
          textfield: textFieldProps,
        },
        {
          grid: {
            gridconfig: {
              alignment: 'center',
              gridwidth: '100%',
            },
          },
          button: buttonProps,
          link: linkProps,
        },
      ]}
      popupType="modal"
      width={450}
    />
  );
};

ForgotPassword.displayName = 'ForgotPassword';

export default ForgotPassword;
