"use client";

import { useState } from "react";
import { ToulminArgument } from "@/types/client";
import { ArgumentGenerator } from "@/components/ai";
import { ToulminDiagram } from "@/components/diagram";
import { Typography } from "@/components/ui/Typography";
import { PageHeader } from "@/components/layout/PageHeader";
import { useArguments } from "@/hooks/useArguments";
import useNotification from "@/hooks/useNotification";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { emptyToulminArgument } from "@/data/toulminTemplates";
import { AIGenerationResult } from "@/hooks/useAI";
import { Locale } from "@/i18n/settings";

export default function ArgumentCreator() {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");
  const aiT = useTranslations("ai");
  const locale = useLocale() as Locale;

  const [argument, setArgument] =
    useState<ToulminArgument>(emptyToulminArgument);
  const [previewResult, setPreviewResult] = useState<AIGenerationResult | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const { createArgument } = useArguments();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const handleGenerate = (generatedArgument: ToulminArgument) => {
    setArgument(generatedArgument);
    setPreviewResult(null); // Clear preview when directly generating
  };

  const handlePreview = (result: AIGenerationResult) => {
    setPreviewResult(result);
    setArgument(result.argument);
  };

  const handleSave = async () => {
    if (!argument.parts.claim || !argument.name) {
      showError(commonT("error"), "Please generate an argument first");
      return;
    }

    setIsSaving(true);

    try {
      const argumentId = await createArgument(argument);

      if (argumentId) {
        showSuccess(commonT("success"), t("saveSuccess"));
        router.push(`/argument/view/${argumentId}`);
      } else {
        showError(commonT("error"), t("saveFailed"));
      }
    } catch (error) {
      console.error("Error saving AI-generated argument:", error);
      showError(
        t("saveFailed"),
        error instanceof Error ? error.message : "Failed to save argument"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setArgument(emptyToulminArgument);
    setPreviewResult(null);
  };

  const hasArgument =
    argument.parts.claim && argument.parts.claim.trim().length > 0;

  const headerButtons = [
    ...(hasArgument
      ? [
          {
            text: t("saveAndView"),
            onClick: handleSave,
            variant: "primary" as const,
            disabled: isSaving,
          },
          {
            text: commonT("reset"),
            onClick: handleReset,
            variant: "secondary" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-8xl pb-12">
      <div className="flex flex-col gap-4 mb-6">
        <PageHeader title={aiT("creator.title")} buttons={headerButtons}>
          <Typography textColor="muted" className="mt-1">
            {aiT("creator.description")}
          </Typography>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Generator Panel */}
        <div className="space-y-6">
          <ArgumentGenerator
            onGenerate={handleGenerate}
            onPreview={handlePreview}
            language={locale}
            className="lg:sticky lg:top-6"
          />

          {/* Preview Information */}
          {previewResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Typography
                variant="h3"
                className="text-sm font-medium mb-2 text-blue-800"
              >
                {aiT("preview.title")}
              </Typography>

              <div className="space-y-2">
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-blue-800"
                  >
                    {aiT("preview.confidence")}
                  </Typography>
                  <Typography variant="body-sm" textColor="muted">
                    {Math.round(previewResult.confidence * 100)}%
                  </Typography>
                </div>

                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-blue-800"
                  >
                    {aiT("preview.reasoning")}
                  </Typography>
                  <Typography variant="body-sm" textColor="muted">
                    {previewResult.reasoning}
                  </Typography>
                </div>

                {previewResult.suggestions.length > 0 && (
                  <div>
                    <Typography
                      variant="body-sm"
                      className="font-medium text-blue-800"
                    >
                      {aiT("preview.suggestions")}
                    </Typography>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {previewResult.suggestions.map((suggestion) => (
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

        {/* Diagram Preview Panel */}
        <div className="space-y-6">
          {hasArgument ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h3" className="text-lg font-medium">
                  {aiT("diagram.title")}
                </Typography>
                {isSaving && (
                  <Typography
                    variant="body-sm"
                    textColor="muted"
                    className="flex items-center"
                  >
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    {commonT("saving")}
                  </Typography>
                )}
              </div>

              <ToulminDiagram
                data={argument}
                showExportButtons={false}
                showTitle={false}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <Typography
                    variant="h3"
                    className="text-lg font-medium text-gray-900"
                  >
                    {aiT("placeholder.title")}
                  </Typography>
                  <Typography
                    variant="body-sm"
                    textColor="muted"
                    className="mt-2 max-w-sm"
                  >
                    {aiT("placeholder.description")}
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
