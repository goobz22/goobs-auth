'use client';

import React, { useMemo } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { PopupForm, ExtendedButtonProps, ExtendedTextFieldProps } from 'goobs-frontend';
import { useAuth } from '../../../actions/server/auth/authContext';
import { useRouter } from 'next/navigation';

interface PasswordlessLoginProps {
  showHelperFooter?: boolean;
}

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const PasswordlessLogin: React.FC<PasswordlessLoginProps> = () => {
  console.log('PasswordlessLogin: Component rendering');
  const { setAuthData } = useAuth();
  const router = useRouter();

  const handleSubmit = (values: { email: string }) => {
    console.log('PasswordlessLogin: handleSubmit called');
    console.log('PasswordlessLogin: Form submitted with email:', values.email);
    setAuthData({ email: values.email });
    console.log('PasswordlessLogin: Attempting to navigate to login text verification');
    router.push('/auth?mode=login&step=loginTextVerification');
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
    [formik],
  );

  const buttonProps = useMemo<ExtendedButtonProps[]>(
    () => [
      {
        text: 'Continue',
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
        'aria-label': 'Continue to text verification',
        type: 'button',
        requiredHelperFooterMessage: 'Please fill in required fields',
        disableButton: formik.isSubmitting || !formik.isValid ? 'true' : 'false',
        onClick: () => {
          console.log('PasswordlessLogin: Continue button clicked');
          formik.handleSubmit();
        },
      },
    ],
    [formik],
  );

  const linkProps = useMemo(
    () => [
      {
        link: '/auth?mode=registration',
        text: 'Create account',
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
        link: '/auth?mode=forgotPassword',
        text: 'Forgot password',
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
    [],
  );

  console.log('PasswordlessLogin: Rendering form');
  return (
    <PopupForm
      title="Login"
      description="Login to continue to the application"
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

PasswordlessLogin.displayName = 'PasswordlessLogin';

export default PasswordlessLogin;
