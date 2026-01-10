"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormInput } from "./ui/FormInput";

interface ForgotPasswordFormProps {
  readonly error: string;
  readonly isLoading: boolean;
  readonly successMessage: string;
  readonly onSubmit: (email: string) => void;
  readonly onBackToSignIn: () => void;
}

export function ForgotPasswordForm({
  error,
  isLoading,
  successMessage,
  onSubmit,
  onBackToSignIn,
}: Readonly<ForgotPasswordFormProps>) {
  const t = useTranslations("pages.auth");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="text-sm text-gray-600 mb-4">
        {t("resetPasswordDescription")}
      </div>

      <FormInput
        label={t("emailAddress")}
        id="reset-email-address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        disabled={isLoading || !!successMessage}
      />

      {successMessage && (
        <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading || !!successMessage}
          className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
        >
          {isLoading ? t("sendingResetLink") : t("sendResetLink")}
        </button>

        <button
          type="button"
          onClick={onBackToSignIn}
          className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          {t("backToSignIn")}
        </button>
      </div>
    </form>
  );
}
