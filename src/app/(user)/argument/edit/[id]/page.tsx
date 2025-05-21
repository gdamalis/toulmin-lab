"use client";

import { ToulminDiagram } from "@/components/diagram";
import { ToulminForm } from "@/components/ToulminForm";
import { Typography } from "@/components/ui/Typography";
import { useArguments } from "@/hooks/useArguments";
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

  const [toulminArgument, setToulminArgument] = useState<ToulminArgument | null>(null);
  const { getArgumentById, updateArgument, isLoading, error } = useArguments();
  const { showSuccess, showError } = useNotification();
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

  const handleFormChange = (data: ToulminArgument) => {
    setToulminArgument(data);
  };

  const handleSave = async () => {
    if (!toulminArgument) {
      showError(commonT("error"), "No argument data to save");
      return;
    }

    const success = await updateArgument(toulminArgumentId, toulminArgument);
    
    if (success) {
      showSuccess(commonT("success"), t("saveSuccess"));
      // Redirect to the view page
      router.push(`/argument/view/${toulminArgumentId}`);
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
