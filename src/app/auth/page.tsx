'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import Link from 'next/link';

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <AuthForm />
        <div className="text-center mt-6">
          <Link
            href="/"
            className="font-medium text-gray-600 hover:text-gray-500 text-sm"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
} 