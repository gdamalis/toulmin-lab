"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAI } from "@/hooks/useAI";
import { useArguments } from "@/hooks/useArguments";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useTranslations, useLocale } from "next-intl";
import { Locale } from "@/i18n/settings";
import useNotification from "@/hooks/useNotification";

interface QuickArgumentGeneratorProps {
  className?: string;
}

export function QuickArgumentGenerator({
  className = "",
}: Readonly<QuickArgumentGeneratorProps>) {
  const dashboardT = useTranslations("pages.dashboard");
  const commonT = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { showSuccess, showError } = useNotification();

  const [prompt, setPrompt] = useState("");
  const [isGeneratingAndSaving, setIsGeneratingAndSaving] = useState(false);

  const { generateArgument, validatePrompt, isGenerating, error, clearError } =
    useAI();
  const { createArgument } = useArguments();

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setPrompt(value);

      // Clear error when user starts typing
      if (error && value.trim().length > 0) {
        clearError();
      }
    },
    [error, clearError]
  );

  const handleQuickGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      showError(commonT("error"), validation.error ?? "Invalid prompt");
      return;
    }

    setIsGeneratingAndSaving(true);

    try {
      const result = await generateArgument(prompt, undefined, locale);

      if (result) {
        // Auto-save the generated argument
        const argumentId = await createArgument(result.argument);

        if (argumentId) {
          showSuccess(
            commonT("success"),
            "Argument generated and saved successfully!"
          );
          router.push(`/argument/view/${argumentId}`);
        } else {
          showError(commonT("error"), "Failed to save generated argument");
        }
      }
    } catch (error) {
      console.error("Error generating argument:", error);
      showError(
        commonT("error"),
        error instanceof Error ? error.message : "Failed to generate argument"
      );
    } finally {
      setIsGeneratingAndSaving(false);
    }
  }, [
    prompt,
    validatePrompt,
    generateArgument,
    createArgument,
    locale,
    router,
    showSuccess,
    showError,
    commonT,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleQuickGenerate();
      }
    },
    [handleQuickGenerate]
  );

  const handleGoToFullCreator = () => {
    router.push("/argument/create");
  };

  const promptValidation = validatePrompt(prompt);
  const isPromptValid = promptValidation.valid;
  const canGenerate =
    isPromptValid &&
    prompt.trim().length > 0 &&
    !isGenerating &&
    !isGeneratingAndSaving;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <Typography
            variant="h2"
            className="text-xl font-semibold text-gray-900"
          >
            {dashboardT("quickGenerate.title")}
          </Typography>
          <Typography variant="body-sm" textColor="muted" className="mt-1">
            {dashboardT("quickGenerate.description")}
          </Typography>
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              placeholder={dashboardT("quickGenerate.placeholder")}
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 ${
                !isPromptValid && prompt.length > 0
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
              rows={4}
              disabled={isGenerating || isGeneratingAndSaving}
            />

            {/* Character count */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {prompt.length}/2000
            </div>
          </div>

          {/* Error message */}
          {!isPromptValid && prompt.length > 0 && (
            <Typography
              variant="body-sm"
              textColor="danger"
              className="text-sm"
            >
              {promptValidation.error}
            </Typography>
          )}

          {/* AI Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <Typography variant="body-sm" className="text-red-800">
                {error}
              </Typography>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 items-center justify-end">
            {/* <Button
              onClick={handleGoToFullCreator}
              variant="secondary"
              className="text-sm"
              disabled={isGenerating || isGeneratingAndSaving}
            >
              {dashboardT("quickGenerate.fullCreator")}
            </Button> */}

            <div className="flex items-center gap-2">
              <Typography
                variant="body-sm"
                textColor="muted"
                className="text-xs"
              >
                {dashboardT("quickGenerate.shortcut")}
              </Typography>
              <Button
                onClick={handleQuickGenerate}
                disabled={!canGenerate}
                variant="primary"
                className="min-w-[120px]"
              >
                {isGeneratingAndSaving ? (
                  <span className="flex items-center">
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {dashboardT("quickGenerate.generating")}
                  </span>
                ) : (
                  dashboardT("quickGenerate.generate")
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
