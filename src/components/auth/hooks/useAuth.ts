'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { AuthMode, FormState } from '../types';

export function useAuth(redirectPath = '/dashboard') {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if returning from a redirect flow
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully authenticated
          router.push(redirectPath);
        }
      } catch (err) {
        if (err instanceof FirebaseError) {
          console.error('Redirect authentication error:', err);
          setError(`Authentication error: ${err.code}`);
        }
      }
    };

    checkRedirectResult();
  }, [router, redirectPath]);

  const handleGoogleAuth = async () => {
    setError('');
    setIsGoogleLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      
      // When using emulator, popups work better than redirects
      if (process.env.NODE_ENV === 'development') {
        // Using signInWithPopup in development with emulator
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          router.push(redirectPath);
        }
      } else {
        // In production, use redirect as before
        await signInWithRedirect(auth, provider);
      }
    } catch (err) {
      setIsGoogleLoading(false);
      if (err instanceof FirebaseError) {
        setError(`Authentication failed: ${err.code}`);
      } else {
        setError('Authentication with Google failed. Please try again.');
      }
      console.error(err);
    }
  };

  const handleEmailAuth = async (mode: AuthMode, formData: FormState) => {
    const { email, password, name } = formData;
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        router.push(redirectPath);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });
        router.push(redirectPath);
      }
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/email-already-in-use') {
          setError('Email already in use');
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email format');
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setError('Invalid email or password');
        } else {
          setError(`Failed to ${mode === 'signin' ? 'sign in' : 'create account'}`);
          console.error(err);
        }
      } else {
        setError('An unexpected error occurred');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    setError,
    isLoading,
    isGoogleLoading,
    handleGoogleAuth,
    handleEmailAuth
  };
} 