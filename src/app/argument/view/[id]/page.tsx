"use client";

import { ToulminDiagram } from "@/components/diagram";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function ToulminArgumentViewPage({
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
  const router = useRouter();

  const unwrappedParams = use(params);
  const toulminArgumentId = unwrappedParams.id;

  useEffect(() => {
    const fetchDiagram = async () => {
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
          throw new Error(`${t("fetchFailed")}: ${response.statusText}`);
        }

        const data = await response.json();
        setToulminArgument(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("unknownError"));
        console.error("Error fetching diagram:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagram();
  }, [toulminArgumentId, user, t]);

  const handleEdit = () => {
    router.push(`/argument/edit/${toulminArgumentId}`);
  };

  const handleBack = () => {
    router.push("/dashboard");
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

    if (toulminArgument) {
      return (
        <div className="mt-6">
          <ToulminDiagram data={toulminArgument} />
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        <Typography textColor="muted">{t("diagramNotFound")}</Typography>
      </div>
    );
  };

  return (
    <AppShell title={toulminArgument?.name || t("toulminArgumentDiagram")}>
      <div className="mx-auto max-w-8xl pb-12">
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={handleBack}>
                ← {t("backToDashboard")}
              </Button>
              <Button onClick={handleEdit}>{t("editDiagram")}</Button>
            </div>
            <div>
              <Typography variant="h2">
                {toulminArgument?.name ||
                  `${t("diagram")} ${toulminArgumentId.substring(0, 8)}`}
              </Typography>
              {toulminArgument && (
                <Typography textColor="muted" className="mt-1">
                  {t("lastUpdated")}:{" "}
                  {new Date(toulminArgument.updatedAt).toLocaleString()}
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
