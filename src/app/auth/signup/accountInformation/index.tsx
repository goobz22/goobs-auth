import React, { useMemo } from 'react';
import { PopupForm, ExtendedTextFieldProps, ExtendedButtonProps } from 'goobs-frontend';
import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { z } from 'zod';
import { useAuth, AuthData } from '../../../../actions/server/auth/authContext';
import { useRouter } from 'next/navigation';

const validationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const AccountInfoStep: React.FC = () => {
  console.log('AccountInfoStep: Component rendering');
  const { getAuthData, setAuthData } = useAuth();
  const authData = getAuthData();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      firstName: authData.firstName || '',
      lastName: authData.lastName || '',
      phoneNumber: authData.phoneNumber || '',
    },
    validationSchema: toFormikValidationSchema(validationSchema),
    onSubmit: (values) => {
      console.log('AccountInfoStep: Form submitted', values);
      setAuthData((prevData: AuthData) => ({ ...prevData, ...values }));
      console.log('AccountInfoStep: Navigating to signup text verification');
      router.push('/auth?mode=registration&step=signupTextVerification');
    },
  });

  const textFieldProps = useMemo<ExtendedTextFieldProps[]>(
    () => [
      {
        name: 'firstName',
        label: 'First Name',
        placeholder: 'Enter your first name',
        error: formik.touched.firstName && Boolean(formik.errors.firstName),
        helperText: formik.touched.firstName && formik.errors.firstName,
        required: true,
        columnconfig: {
          row: 1,
          column: 1,
          alignment: 'left',
          columnwidth: '100%',
        },
        InputProps: {
          'aria-label': 'Enter your first name',
        },
        value: formik.values.firstName,
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
      },
      {
        name: 'lastName',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        error: formik.touched.lastName && Boolean(formik.errors.lastName),
        helperText: formik.touched.lastName && formik.errors.lastName,
        required: true,
        columnconfig: {
          row: 2,
          column: 1,
          alignment: 'left',
          columnwidth: '100%',
        },
        InputProps: {
          'aria-label': 'Enter your last name',
        },
        value: formik.values.lastName,
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
      },
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        error: formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber),
        helperText: formik.touched.phoneNumber && formik.errors.phoneNumber,
        required: true,
        columnconfig: {
          row: 3,
          column: 1,
          alignment: 'left',
          columnwidth: '100%',
        },
        InputProps: {
          'aria-label': 'Enter your phone number',
        },
        value: formik.values.phoneNumber,
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
      },
    ],
    [formik],
  );

  const buttonProps = useMemo<ExtendedButtonProps[]>(
    () => [
      {
        text: 'Back',
        fontcolor: 'black',
        variant: 'outlined',
        backgroundcolor: 'white',
        width: '100%',
        fontvariant: 'merriparagraph',
        columnconfig: {
          row: 1,
          column: 1,
          margintop: 1,
          marginright: 1,
          alignment: 'center',
          columnwidth: '48%',
        },
        type: 'button',
        onClick: () => {
          console.log('AccountInfoStep: Back button clicked');
          router.push('/auth?mode=registration&step=signup');
        },
        'aria-label': 'Go back to signup',
      },
      {
        text: 'Submit',
        fontcolor: 'white',
        variant: 'contained',
        backgroundcolor: 'black',
        width: '100%',
        fontvariant: 'merriparagraph',
        columnconfig: {
          row: 1,
          column: 2,
          margintop: 1,
          alignment: 'center',
          columnwidth: '48%',
        },
        type: 'button',
        onClick: () => {
          console.log('AccountInfoStep: Submit button clicked');
          formik.handleSubmit();
        },
        'aria-label': 'Submit account information and proceed to text verification',
        disableButton: !formik.isValid || formik.isSubmitting ? 'true' : 'false',
      },
    ],
    [formik, router],
  );

  console.log('AccountInfoStep: Rendering form');
  return (
    <PopupForm
      title="Account Information"
      description="Please provide your account details"
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
        },
      ]}
      popupType="modal"
      width={450}
    />
  );
};

export default AccountInfoStep;
