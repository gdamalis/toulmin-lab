"use client";

import { ToulminDiagram } from "@/components/diagram";
import { ToulminForm } from "@/components/form";
import { emptyToulminArgument } from "@/data/toulminTemplates";
import { useArguments, useNotification } from "@/hooks";
import { getToulminDiagramKey } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/track";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ToulminArgumentBuilder() {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");

  const [toulminArgument, setToulminArgument] = 
    useState<ToulminArgument>(emptyToulminArgument);
  const { createArgument } = useArguments();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  // Track page view on mount
  useEffect(() => {
    trackEvent("argument.create_view", { source: "manual" });
  }, []);

  const handleFormChange = (data: ToulminArgument) => {
    setToulminArgument(data);
  };

  const handleSave = async () => {
    try {
      trackEvent("argument.save_attempt", { source: "manual" });
      const argumentId = await createArgument(toulminArgument);
      
      if (argumentId) {
        trackEvent("argument.save_success", { source: "manual" });
        showSuccess(commonT("success"), t("saveSuccess"));
        // Redirect to the view page using the returned ID
        router.push(`/argument/view/${argumentId}`);
      } else {
        trackEvent("argument.save_error", { source: "manual", error_type: "no_id_returned" });
        showError(commonT("error"), t("saveFailed"));
      }
    } catch (error) {
      console.error("Error saving diagram:", error);
      trackEvent("argument.save_error", { source: "manual", error_type: "exception" });
      showError(
        t("saveFailed"),
        error instanceof Error ? error.message : "Failed to save diagram"
      );
    }
  };

  return (
    <div className="mx-auto max-w-8xl h-[calc(100vh-10rem)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        <div className="md:overflow-y-auto">
          <ToulminForm
            onSubmit={handleSave}
            onChange={handleFormChange}
            initialData={toulminArgument}
          />
        </div>
        <div className="h-full flex flex-col">
          <ToulminDiagram 
            key={getToulminDiagramKey(toulminArgument)}
            data={toulminArgument} 
            showExportButtons={false} 
          />
        </div>
      </div>
    </div>
  );
}
