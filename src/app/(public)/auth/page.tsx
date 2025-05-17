'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Auth() {
  const t = useTranslations('pages.auth');
  
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          alt="Toulmin Lab"
          src="/logo.png"
          width={320}
          height={320}
          className="mx-auto w-auto h-12"
        />
      </div>

      <div className="mt-10 px-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <AuthForm />
        <div className="text-center mt-6">
          <Link
            href="/"
            className="font-medium text-gray-600 hover:text-gray-500 text-sm"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
} 