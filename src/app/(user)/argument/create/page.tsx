"use client";

import { ToulminDiagram } from "@/components/diagram";
import { ToulminForm } from "@/components/form";
import { emptyToulminArgument } from "@/data/toulminTemplates";
import { useArguments } from "@/hooks/useArguments";
import useNotification from "@/hooks/useNotification";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ToulminArgumentBuilder() {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");

  const [toulminArgument, setToulminArgument] = 
    useState<ToulminArgument>(emptyToulminArgument);
  const { createArgument } = useArguments();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const handleFormChange = (data: ToulminArgument) => {
    setToulminArgument(data);
  };

  const handleSave = async () => {
    try {
      const argumentId = await createArgument(toulminArgument);
      
      if (argumentId) {
        showSuccess(commonT("success"), t("saveSuccess"));
        // Redirect to the view page using the returned ID
        router.push(`/argument/view/${argumentId}`);
      } else {
        showError(commonT("error"), t("saveFailed"));
      }
    } catch (error) {
      console.error("Error saving diagram:", error);
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
          <ToulminDiagram data={toulminArgument} showExportButtons={false} />
        </div>
      </div>
    </div>
  );
}
