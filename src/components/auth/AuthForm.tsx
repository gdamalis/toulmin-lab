'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider 
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
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
          router.push('/dashboard');
        }
      } catch (err) {
        if (err instanceof FirebaseError) {
          console.error('Redirect authentication error:', err);
          setError(`Authentication error: ${err.code}`);
        }
      }
    };

    checkRedirectResult();
  }, [router]);

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
          router.push('/dashboard');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validate password strength
      if (password.length < 6) {
        setError('Password should be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
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

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </h2>
      </div>

      {/* Google Auth Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isGoogleLoading ? (
            'Processing...'
          ) : (
            <>
              <span className="mr-2">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v3.2h5.59c-0.51,2.83-2.94,4.95-5.59,4.95c-3.22,0-5.83-2.61-5.83-5.83s2.61-5.83,5.83-5.83 c1.54,0,2.93,0.6,3.98,1.57L18,6.08C16.42,4.61,14.3,3.75,12,3.75c-4.98,0-9,4.03-9,9s4.02,9,9,9s9-4.03,9-9 C21,11.72,20.75,11.39,21.35,11.1z" fill="#4285f4"></path>
                    <path d="M3,3h18v18H3V3z" fill="none"></path>
                  </g>
                </svg>
              </span>
              Continue with Google
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${mode === 'signin' ? 'rounded-b-md' : ''} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
              placeholder="Password"
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading 
              ? (mode === 'signin' ? 'Signing in...' : 'Creating account...') 
              : (mode === 'signin' ? 'Sign in' : 'Sign up')}
          </button>
        </div>
      </form>

      <div className="text-sm text-center">
        <button 
          type="button"
          onClick={toggleMode} 
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          {mode === 'signin' 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
} 