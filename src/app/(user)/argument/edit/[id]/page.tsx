"use client";

import { ToulminDiagram } from "@/components/diagram";
import { ToulminForm } from "@/components/ToulminForm";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import useNotification from "@/hooks/useNotification";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function ToulminArgumentEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");

  const [toulminArgument, setToulminArgument] =
    useState<ToulminArgument | null>(null);
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
    }
  };

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
}
