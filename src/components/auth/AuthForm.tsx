"use client";

import { useState } from "react";
import { useAuthFlow } from "./hooks/useAuth";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { GoogleAuthButton } from "./ui/GoogleAuthButton";
import { FormDivider } from "./ui/FormDivider";
import { AuthMode, AuthFormProps, FormState } from "./types";
import { useTranslations } from "next-intl";
import { Loader } from "@/components/ui/Loader";
import { track } from "@vercel/analytics";

export function AuthForm({
  redirectPath = "/dashboard",
}: Readonly<AuthFormProps>) {
  const t = useTranslations("pages.auth");
  const commonT = useTranslations("common");
  const errorT = useTranslations("errors.auth");
  const [mode, setMode] = useState<AuthMode>("signin");
  const {
    error,
    setError,
    isLoading,
    isGoogleLoading,
    isAuthenticating,
    resetSuccessMessage,
    setResetSuccessMessage,
    handleGoogleAuth,
    handleEmailAuth,
    handlePasswordReset,
  } = useAuthFlow(redirectPath);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "signin" ? "signup" : "signin"));
    setError("");
    setResetSuccessMessage("");
  };

  const handleForgotPassword = () => {
    setMode("forgot-password");
    setError("");
    setResetSuccessMessage("");
  };

  const handleBackToSignIn = () => {
    setMode("signin");
    setError("");
    setResetSuccessMessage("");
  };

  const handleSubmit = (formData: FormState) => {
    // Validation for sign up
    if (mode === "signup") {
      // Validate name
      if (!formData.name.trim()) {
        setError(errorT("nameMissing"));
        return;
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError(errorT("passwordMismatch"));
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        setError(errorT("passwordTooShort"));
        return;
      }
    }

    track("auth_started", { method: "email", mode });
    handleEmailAuth(mode, formData);
  };

  const handleGoogleClick = () => {
    track("auth_started", { method: "google", mode });
    handleGoogleAuth();
  };

  if (isAuthenticating) {
    return <Loader fullScreen text={commonT("loading")} />;
  }

  return (
    <div className="flex flex-col gap-y-6">
      <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        {mode === "signin" 
          ? t("signInHeading") 
          : mode === "signup"
          ? t("signUpHeading")
          : t("resetPasswordHeading")}
      </h2>

      <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
        {mode === "signin" ? (
          <SignInForm
            error={error}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onForgotPassword={handleForgotPassword}
          />
        ) : mode === "signup" ? (
          <SignUpForm
            error={error}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        ) : (
          <ForgotPasswordForm
            error={error}
            isLoading={isLoading}
            successMessage={resetSuccessMessage}
            onSubmit={handlePasswordReset}
            onBackToSignIn={handleBackToSignIn}
          />
        )}

        {mode !== "forgot-password" && (
          <div>
            <FormDivider text={t("orContinueWith")} />

            <div className="mt-6 grid grid-cols-1 gap-4">
              <GoogleAuthButton
                isLoading={isGoogleLoading}
                onClick={handleGoogleClick}
              />
            </div>
          </div>
        )}
      </div>

      {mode !== "forgot-password" && (
        <p className="mt-10 text-center text-sm/6 text-gray-500">
          {mode === "signin" ? t("noAccount") : t("haveAccount")}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-primary-600 hover:text-primary-500"
          >
            {mode === "signin" ? t("signUp") : t("signIn")}
          </button>
        </p>
      )}
    </div>
  );
}
