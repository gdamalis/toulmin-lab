"use client";

import AppShell from "@/components/layout/AppShell";
import ToulminDiagram from "@/components/ToulminDiagram";
import { ToulminForm } from "@/components/ToulminForm";
import { ToulminArgument } from "@/types/client";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useTranslations } from "next-intl";

export default function ToulminArgumentEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");

  const [toulminArgument, setToulminArgument] =
    useState<ToulminArgument | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const unwrappedParams = use(params);
  const toulminArgumentId = unwrappedParams.id;

  useEffect(() => {
    const fetchArgument = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get the current user's ID token
        const token = await user.getIdToken();

        const response = await fetch(`/api/argument/${toulminArgumentId}`, {
          headers: {
            "user-id": user.uid,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch argument: ${response.statusText}`);
        }

        const data = await response.json();
        setToulminArgument(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching argument:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArgument();
  }, [toulminArgumentId, user]);

  const handleFormChange = (data: ToulminArgument) => {
    setToulminArgument(data);
  };

  const handleSave = async () => {
    // Only save if user is logged in and argument is loaded
    if (!user) {
      showError(t("authRequired"), t("pleaseSignIn"));
      return;
    }

    if (!toulminArgument) {
      showError(commonT("error"), "No argument data to save");
      return;
    }

    try {
      setIsSaving(true);

      // Get the current user's ID token
      const token = await user.getIdToken();

      // Send to the API using PUT method
      const response = await fetch(`/api/argument/${toulminArgumentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toulminArgument),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? t("saveFailed"));
      }

      showSuccess(commonT("success"), t("saveSuccess"));

      // Redirect to the view page
      router.push(`/argument/view/${toulminArgumentId}`);
    } catch (error) {
      console.error("Error updating diagram:", error);
      showError(
        t("saveFailed"),
        error instanceof Error ? error.message : t("saveFailed")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/argument/view/${toulminArgumentId}`);
  };

  // Function to render content based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Typography textColor="muted">{commonT("loading")}</Typography>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-6 rounded-lg text-center text-red-600">
          <Typography>
            {commonT("error")}: {error}
          </Typography>
        </div>
      );
    }

    if (!toulminArgument) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
          <Typography textColor="muted">{t("diagramNotFound")}</Typography>
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <AppShell title={t("editToulminArgument")}>
      <div className="mx-auto max-w-8xl pb-12">
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={handleCancel}>
                ← {t("backToView")}
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || isLoading || !toulminArgument}
              >
                {t("saveAndView")}
              </Button>
            </div>
            <div>
              <Typography variant="h2">
                {t("edit", { title: toulminArgument?.name ?? "" })}
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

          {renderContent()}
        </div>
      </div>
    </AppShell>
  );
}
