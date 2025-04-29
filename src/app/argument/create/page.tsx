"use client";

import AppShell from "@/components/layout/AppShell";
import ToulminDiagram from "@/components/ToulminDiagram";
import { ToulminForm } from "@/components/ToulminForm";
import { useAuth } from "@/contexts/AuthContext";
import { emptyToulminArgument } from "@/data/toulminTemplates";
import useNotification from "@/hooks/useNotification";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

export default function ToulminArgumentBuilder() {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");

  const [toulminArgument, setToulminArgument] =
    useState<ToulminArgument>(emptyToulminArgument);
  const [isSaving, setIsSaving] = useState(false);
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
      setIsSaving(true);

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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell title={t("createYourArgument")}>
      <div className="mx-auto max-w-8xl pb-12">
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2 w-full">
              <Button onClick={handleSave} disabled={isSaving}>
                {t("saveAndView")}
              </Button>
            </div>
            <div>
              <Typography variant="h2">
                {toulminArgument?.name
                  ? toulminArgument.name
                  : t("createYourArgument")}
              </Typography>
              {isSaving && (
                <Typography textColor="muted" className="mt-1">
                  {commonT("saving")}
                </Typography>
              )}
              {!user && (
                <Typography textColor="warning" className="mt-1">
                  {t("signInToSave")}
                </Typography>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:overflow-y-auto">
              <ToulminForm
                onSubmit={handleSave}
                onChange={handleFormChange}
                initialData={toulminArgument}
                buttonText={t("saveAndView")}
              />
            </div>
            <div>
              <ToulminDiagram
                data={toulminArgument}
                showExportButtons={false}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
