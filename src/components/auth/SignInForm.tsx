"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormState } from "./types";
import { FormInput } from "./ui/FormInput";

interface SignInFormProps {
  readonly error: string;
  readonly isLoading: boolean;
  readonly onSubmit: (formData: FormState) => void;
  readonly onForgotPassword: () => void;
}

export function SignInForm({
  error,
  isLoading,
  onSubmit,
  onForgotPassword,
}: Readonly<SignInFormProps>) {
  const t = useTranslations("pages.auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email,
      password,
      name: "",
      confirmPassword: "",
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FormInput
        label={t("emailAddress")}
        id="email-address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
      />

      <FormInput
        label={t("password")}
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("passwordPlaceholder")}
      />

      <div className="flex items-center justify-end">
        <div className="text-sm/6">
          <button
            type="button"
            onClick={onForgotPassword}
            className="font-semibold text-primary-600 hover:text-primary-500 cursor-pointer"
          >
            {t("forgotPassword")}
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
        >
          {isLoading ? t("signingIn") : t("signIn")}
        </button>
      </div>
    </form>
  );
}
