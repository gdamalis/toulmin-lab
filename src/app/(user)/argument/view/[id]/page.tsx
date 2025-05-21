"use client";

import { ToulminDiagram } from "@/components/diagram";
import { PageHeader } from "@/components/layout/PageHeader";
import { Typography } from "@/components/ui/Typography";
import { useArguments } from "@/hooks/useArguments";
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
  
  const [toulminArgument, setToulminArgument] = useState<ToulminArgument | null>(null);
  const { getArgumentById, isLoading, error } = useArguments();
  const router = useRouter();

  const unwrappedParams = use(params);
  const toulminArgumentId = unwrappedParams.id;

  useEffect(() => {
    const fetchArgument = async () => {
      const argument = await getArgumentById(toulminArgumentId);
      setToulminArgument(argument);
    };

    fetchArgument();
  }, [toulminArgumentId, getArgumentById]);

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
