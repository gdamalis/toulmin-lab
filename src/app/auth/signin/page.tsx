'use client';

import { SignInForm } from '@/components/auth/SignInForm';
import Link from 'next/link';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <SignInForm />
        <div className="text-center mt-6">
          <div className="text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </div>
          <div className="mt-2">
            <Link
              href="/"
              className="font-medium text-gray-600 hover:text-gray-500 text-sm"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 