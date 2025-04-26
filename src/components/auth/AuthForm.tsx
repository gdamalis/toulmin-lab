'use client';

import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { GoogleAuthButton } from './ui/GoogleAuthButton';
import { FormDivider } from './ui/FormDivider';
import { AuthMode, AuthFormProps, FormState } from './types';

export function AuthForm({ redirectPath = '/dashboard' }: Readonly<AuthFormProps>) {
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
        setError('Name is required');
        return;
      }
      
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        setError('Password should be at least 6 characters');
        return;
      }
    }

    handleEmailAuth(mode, formData);
  };

  return (
    <>
      <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
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
          <FormDivider text="Or continue with" />

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
          ? "Don't have an account?" 
          : "Already have an account?"}{' '}
        <button 
          type="button"
          onClick={toggleMode} 
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          {mode === 'signin' 
            ? "Sign up" 
            : "Sign in"}
        </button>
      </p>
    </>
  );
} 