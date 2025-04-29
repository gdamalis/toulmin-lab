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
      <div className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            <div className="space-y-4 md:space-y-0">
              <div className="flex justify-start md:justify-end md:items-center flex-col md:flex-row gap-4 mb-6">
                {/* <h2 className="text-xl font-semibold">
                  {t("createYourArgument")}
                </h2> */}
                <div className="flex space-x-3">
                  {isSaving && (
                    <span className="text-sm text-gray-500 self-center">
                      {commonT("saving")}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("saveAndView")}
                  </button>
                </div>
              </div>

              {!user && (
                <p className="text-sm text-amber-600 mb-4">
                  {t("signInToSave")}
                </p>
              )}

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
        </div>
      </div>
    </AppShell>
  );
}
