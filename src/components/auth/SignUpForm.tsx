'use client';

import { useState } from 'react';
import { FormInput } from './ui/FormInput';
import { FormState } from './types';
import { useTranslations } from 'next-intl';

interface SignUpFormProps {
  readonly error: string;
  readonly isLoading: boolean;
  readonly onSubmit: (formData: FormState) => void;
}

export function SignUpForm({ error, isLoading, onSubmit }: SignUpFormProps) {
  const t = useTranslations('pages.auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      password,
      confirmPassword,
      rememberMe: false
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FormInput
        label={t('fullName')}
        id="name"
        name="name"
        type="text"
        autoComplete="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('fullNamePlaceholder')}
      />

      <FormInput
        label={t('emailAddress')}
        id="email-address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('emailPlaceholder')}
      />

      <FormInput
        label={t('password')}
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('passwordPlaceholder')}
      />

      <FormInput
        label={t('confirmPassword')}
        id="confirm-password"
        name="confirm-password"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t('confirmPasswordPlaceholder')}
      />

      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {isLoading ? t('creatingAccount') : t('signUp')}
        </button>
      </div>
    </form>
  );
} 