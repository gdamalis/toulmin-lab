"use client";

import { ToulminDiagram } from "@/components/diagram";
import { PageHeader } from "@/components/layout/PageHeader";
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
      return <ToulminDiagram data={toulminArgument} />;
    }

    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        <Typography textColor="muted">{t("diagramNotFound")}</Typography>
      </div>
    );
  };

  const pageTitle =
    toulminArgument?.name ||
    `${t("diagram")} ${toulminArgumentId.substring(0, 8)}`;

  const headerButtons = [
    {
      text: t("editDiagram"),
      onClick: handleEdit,
      variant: "primary" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-8xl pb-12">
      <div className="flex flex-col gap-4 mb-6">
        <PageHeader title={pageTitle} buttons={headerButtons}>
          {toulminArgument && (
            <Typography textColor="muted" className="mt-1">
              {t("lastUpdated")}:{" "}
              {new Date(toulminArgument.updatedAt).toLocaleString()}
            </Typography>
          )}
        </PageHeader>
      </div>

      {renderContent()}
    </div>
  );
}
