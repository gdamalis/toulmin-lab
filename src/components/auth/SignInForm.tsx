'use client';

import { useState } from 'react';
import { FormInput } from './ui/FormInput';
import { Checkbox } from './ui/Checkbox';
import { FormState } from './types';

interface SignInFormProps {
  readonly error: string;
  readonly isLoading: boolean;
  readonly onSubmit: (formData: FormState) => void;
}

export function SignInForm({ error, isLoading, onSubmit }: Readonly<SignInFormProps>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email,
      password,
      name: '',
      confirmPassword: '',
      rememberMe
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FormInput
        label="Email address"
        id="email-address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
      />

      <FormInput
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <div className="flex items-center justify-between">
        <Checkbox
          id="remember-me"
          name="remember-me"
          label="Remember me"
          checked={rememberMe}
          onChange={setRememberMe}
        />

        <div className="text-sm/6">
          <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Forgot password?
          </a>
        </div>
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
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
} 