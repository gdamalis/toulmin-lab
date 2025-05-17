"use client";

import { ToulminDiagram } from "@/components/diagram";
import { ToulminForm } from "@/components/ToulminForm";
import { useAuth } from "@/contexts/AuthContext";
import { emptyToulminArgument } from "@/data/toulminTemplates";
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
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const handleFormChange = (data: ToulminArgument) => {
    setToulminArgument(data);
  };

  const handleSave = async () => {
    // Only save if user is logged in
    if (!user) {
      showError(t("authRequired"), t("pleaseSignIn"));
      return;
    }

    try {
      // Get the current user's ID token
      const token = await user.getIdToken();

      // Send to the API
      const response = await fetch("/api/argument/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toulminArgument),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to save diagram");
      }

      showSuccess(commonT("success"), t("saveSuccess"));

      // Redirect to the view page using the returned ID
      if (result.toulminArgumentId) {
        router.push(`/argument/view/${result.toulminArgumentId}`);
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
    <div className="mx-auto max-w-8xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:overflow-y-auto">
          <ToulminForm
            onSubmit={handleSave}
            onChange={handleFormChange}
            initialData={toulminArgument}
          />
        </div>
        <div>
          <ToulminDiagram data={toulminArgument} showExportButtons={false} />
        </div>
      </div>
    </div>
  );
}
