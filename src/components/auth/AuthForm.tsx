'use client';

import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { GoogleAuthButton } from './ui/GoogleAuthButton';
import { FormDivider } from './ui/FormDivider';
import { AuthMode, AuthFormProps, FormState } from './types';
import { useTranslations } from 'next-intl';

export function AuthForm({ redirectPath = '/dashboard' }: Readonly<AuthFormProps>) {
  const t = useTranslations('pages.auth');
  const errorT = useTranslations('errors.auth');
  const [mode, setMode] = useState<AuthMode>('signin');
  const { 
    error, 
    setError,
    isLoading, 
    isGoogleLoading, 
    handleGoogleAuth, 
    handleEmailAuth 
  } = useAuth(redirectPath);

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  const handleSubmit = (formData: FormState) => {
    // Validation for sign up
    if (mode === 'signup') {
      // Validate name
      if (!formData.name.trim()) {
        setError(errorT('nameMissing'));
        return;
      }
      
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError(errorT('passwordMismatch'));
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        setError(errorT('passwordTooShort'));
        return;
      }
    }

    handleEmailAuth(mode, formData);
  };

  return (
    <div className="flex flex-col gap-y-6">
      <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        {mode === 'signin' ? t('signInHeading') : t('signUpHeading')}
      </h2>
      
      <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
        {mode === 'signin' ? (
          <SignInForm 
            error={error} 
            isLoading={isLoading} 
            onSubmit={handleSubmit} 
          />
        ) : (
          <SignUpForm 
            error={error} 
            isLoading={isLoading} 
            onSubmit={handleSubmit} 
          />
        )}

        <div>
          <FormDivider text={t('orContinueWith')} />

          <div className="mt-6 grid grid-cols-1 gap-4">
            <GoogleAuthButton 
              isLoading={isGoogleLoading} 
              onClick={handleGoogleAuth} 
            />
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-sm/6 text-gray-500">
        {mode === 'signin' 
          ? t('noAccount')
          : t('haveAccount')}{' '}
        <button 
          type="button"
          onClick={toggleMode} 
          className="font-semibold text-primary-600 hover:text-primary-500"
        >
          {mode === 'signin' 
            ? t('signUp')
            : t('signIn')}
        </button>
      </p>
    </div>
  );
} 