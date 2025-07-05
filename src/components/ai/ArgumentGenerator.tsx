"use client";

import { useState, useCallback } from "react";
import { ToulminArgument } from "@/types/client";
import { useAI, AIGenerationResult } from "@/hooks/useAI";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useTranslations } from "next-intl";
import { Locale } from "@/i18n/settings";

interface ArgumentGeneratorProps {
  onGenerate: (argument: ToulminArgument) => void;
  onPreview?: (result: AIGenerationResult) => void;
  language?: Locale;
  className?: string;
}

export function ArgumentGenerator({
  onGenerate,
  onPreview,
  language = "en",
  className = "",
}: Readonly<ArgumentGeneratorProps>) {
  const t = useTranslations("ai.generator");
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [lastResult, setLastResult] = useState<AIGenerationResult | null>(null);
  
  const {
    generateArgument,
    validatePrompt,
    isGenerating,
    error,
    rateLimitInfo,
    canGenerate,
    timeUntilReset,
    clearError,
  } = useAI();

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

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      return;
    }

    const result = await generateArgument(
      prompt,
      context || undefined,
      language
    );
    if (result) {
      setLastResult(result);

      // Call preview callback if provided
      if (onPreview) {
        onPreview(result);
      } else {
        // Directly call generate callback
        onGenerate(result.argument);
      }
    }
  }, [
    canGenerate,
    validatePrompt,
    prompt,
    context,
    language,
    generateArgument,
    onPreview,
    onGenerate,
  ]);

  const handleUseGenerated = useCallback(() => {
    if (lastResult) {
      onGenerate(lastResult.argument);
    }
  }, [lastResult, onGenerate]);

  const promptValidation = validatePrompt(prompt);
  const isPromptValid = promptValidation.valid;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <Typography variant="h2" className="text-lg font-semibold">
          {t("title")}
        </Typography>
        <Typography variant="body-sm" textColor="muted" className="mt-1">
          {t("description")}
        </Typography>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label
          htmlFor="ai-prompt"
          className="block text-sm font-medium text-gray-700"
        >
          {t("promptLabel")}
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={handlePromptChange}
          placeholder={t("promptPlaceholder")}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[120px] ${
            !isPromptValid && prompt.length > 0
              ? "border-red-300"
              : "border-gray-300"
          }`}
          disabled={isGenerating}
        />

        {/* Prompt Validation */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {!isPromptValid && prompt.length > 0 && (
              <Typography variant="body-sm" textColor="danger">
                {promptValidation.error}
              </Typography>
            )}
          </div>
          <Typography variant="body-sm" textColor="muted" className="text-xs">
            {prompt.length}/2000 characters
            {promptValidation.estimatedTokens && (
              <span className="ml-2">
                (~{promptValidation.estimatedTokens} tokens)
              </span>
            )}
          </Typography>
        </div>
      </div>

      {/* Context Input (Optional) */}
      <div className="space-y-2">
        <label
          htmlFor="ai-context"
          className="block text-sm font-medium text-gray-700"
        >
          {t("contextLabel")}
        </label>
        <textarea
          id="ai-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={t("contextPlaceholder")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          rows={3}
          disabled={isGenerating}
        />
      </div>

      {/* Rate Limit Info */}
      {rateLimitInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <Typography variant="body-sm" className="text-blue-800">
            {t("rateLimitInfo", {
              remaining: rateLimitInfo.remaining,
              max: rateLimitInfo.maxRequestsPerMinute || 15,
            })}
            {timeUntilReset > 0 && rateLimitInfo.remaining === 0 && (
              <span className="block mt-1">
                {t("rateLimitReset", {
                  seconds: timeUntilReset,
                })}
              </span>
            )}
          </Typography>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <Typography variant="body-sm" className="text-red-800">
            {error}
          </Typography>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={
            !canGenerate || !isPromptValid || prompt.trim().length === 0
          }
          variant="primary"
          className="min-w-[140px]"
        >
          {isGenerating ? (
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("generating")}
            </span>
          ) : (
            t("generateButton")
          )}
        </Button>
      </div>

      {/* Results Preview */}
      {lastResult && onPreview && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-3">
            <Typography variant="h3" className="text-md font-medium">
              {t("generatedResult")}
            </Typography>
            <div className="flex items-center space-x-2">
              <Typography variant="body-sm" textColor="muted">
                {t("confidence", {
                  confidence: Math.round(lastResult.confidence * 100),
                })}
              </Typography>
              <Button
                onClick={handleUseGenerated}
                variant="secondary"
                size="sm"
              >
                {t("useGenerated")}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Typography variant="body-sm" className="font-medium">
              {lastResult.argument.name}
            </Typography>
            <Typography variant="body-sm" textColor="muted">
              {lastResult.reasoning}
            </Typography>

            {lastResult.suggestions.length > 0 && (
              <div className="mt-3">
                <Typography variant="body-sm" className="font-medium mb-1">
                  {t("suggestions")}
                </Typography>
                <ul className="list-disc list-inside space-y-1">
                  {lastResult.suggestions.map((suggestion) => (
                    <li key={suggestion}>
                      <Typography variant="body-sm" textColor="muted">
                        {suggestion}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
