// File: AuthSteps/SignUpStep.tsx
import React from 'react';
import { Box } from '@mui/material';
import { PopupForm, ExtendedTextFieldProps, ExtendedButtonProps } from 'goobs-frontend';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { z } from 'zod';
import { useAuth, AuthData } from '../../../actions/server/auth/authContext';
import { useRouter } from 'next/navigation';

const SignUpStep: React.FC = () => {
  console.log('SignUpStep: Component rendering');
  const { getAuthData, setAuthData } = useAuth();
  const authData = getAuthData();
  const router = useRouter();

  const validationSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Must contain one uppercase letter, number, and special character',
      ),
  });

  const formik = useFormik({
    initialValues: {
      email: authData.email || '',
      password: '',
    },
    validationSchema: toFormikValidationSchema(validationSchema),
    onSubmit: (values) => {
      console.log('SignUpStep: onSubmit function called');
      console.log('SignUpStep: Form values:', values);

      setAuthData((prevData: AuthData) => {
        console.log('SignUpStep: Previous auth data:', prevData);
        const newData = {
          ...prevData,
          email: values.email,
          password: values.password,
        };
        console.log('SignUpStep: New auth data:', newData);
        return newData;
      });

      console.log('SignUpStep: Attempting to navigate to account info step');
      router.push('/auth?mode=registration&step=accountInfo');
    },
  });

  const textFieldProps: ExtendedTextFieldProps[] = [
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email address',
      error: formik.touched.email && Boolean(formik.errors.email),
      helperText: formik.touched.email && formik.errors.email,
      required: true,
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
      },
      InputProps: {
        'aria-label': 'Enter your email address',
      },
      value: formik.values.email,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      type: 'password',
      error: formik.touched.password && Boolean(formik.errors.password),
      helperText: formik.touched.password && formik.errors.password,
      required: true,
      columnconfig: {
        row: 2,
        column: 1,
        alignment: 'left',
        columnwidth: '100%',
      },
      InputProps: {
        'aria-label': 'Enter your password',
      },
      value: formik.values.password,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
    },
  ];

  const buttonProps: ExtendedButtonProps[] = [
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
        alignment: 'center',
        columnwidth: '33.3%',
      },
      type: 'button',
      'aria-label': 'Continue to account information',
      disableButton: !formik.isValid || formik.isSubmitting ? 'true' : 'false',
      onClick: () => {
        console.log('SignUpStep: Continue button clicked');
        formik.handleSubmit();
      },
    },
  ];

  const linkProps = [
    {
      link: '/auth',
      text: 'Login instead',
      fontcolor: 'marine.main',
      fontvariant: 'merriparagraph' as const,
      columnconfig: {
        row: 1,
        column: 1,
        alignment: 'left' as const,
        columnwidth: '33%',
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
        columnwidth: '33%',
      },
    },
  ];

  console.log('SignUpStep: Rendering form');
  return (
    <Box>
      <PopupForm
        title="Registration"
        description="Create your account to get started"
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
    </Box>
  );
};

export default SignUpStep;
