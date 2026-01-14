"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSubscribe } from "@/hooks";

interface SubscribeFormProps {
  className?: string;
}

export function SubscribeForm({
  className = "",
}: Readonly<SubscribeFormProps>) {
  const t = useTranslations("pages.home.hero.subscribe");
  const [email, setEmail] = useState("");
  
  const { status, error, subscribe } = useSubscribe();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;
    
    const success = await subscribe(email);
    // Reset email on success
    if (success) {
      setEmail("");
    }
  };

  return (
    <div className={`${className} flex flex-col gap-4`}>
      {status === "success" ? (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {t("success")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="sm:flex sm:max-w-md">
          <label htmlFor="email-address" className="sr-only">
            {t("emailPlaceholder")}
          </label>
          <input
            type="email"
            name="email"
            id="email-address"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:w-64 sm:text-sm sm:leading-6"
            placeholder={t("emailPlaceholder")}
          />
          <div className="mt-3 rounded-md sm:ml-3 sm:mt-0 sm:flex-shrink-0">
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-75"
            >
              {status === "loading" ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {t("buttonText")}
            </button>
          </div>
        </form>
      )}

      {status === "error" && (
        <div className="mt-2 text-sm text-red-600">
          {t("error")} {error}
        </div>
      )}
    </div>
  );
}
