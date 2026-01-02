"use client";

import { ToulminDiagram } from "@/components/diagram";
import { ToulminForm } from "@/components/form";
import { Badge } from "@/components/ui";
import { Typography } from "@/components/ui/Typography";
import { useArguments } from "@/hooks/useArguments";
import useNotification from "@/hooks/useNotification";
import { ToulminArgument } from "@/types/client";
import { ClientArgumentDraft } from "@/types/coach";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { updateDraftFromEditorAction } from "@/app/(user)/argument/coach/actions";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

interface ResolvedData {
  kind: "argument" | "draft";
  argument?: ToulminArgument;
  draft?: ClientArgumentDraft;
}

export default function ToulminArgumentEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");

  const [resolvedData, setResolvedData] = useState<ResolvedData | null>(null);
  const [toulminArgument, setToulminArgument] = useState<ToulminArgument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateArgument } = useArguments();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDraftQuery = searchParams.get("draft") === "true";

  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/argument/resolve/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to fetch data");
      }

      const { data } = await response.json();
      setResolvedData(data);
      
      // Convert to ToulminArgument format for the form
      if (data.kind === "argument" && data.argument) {
        setToulminArgument(data.argument);
      } else if (data.kind === "draft" && data.draft) {
        const draft = data.draft as ClientArgumentDraft;
        setToulminArgument({
          _id: draft.id,
          name: draft.name,
          parts: {
            claim: draft.claim ?? "",
            grounds: draft.grounds ?? "",
            warrant: draft.warrant ?? "",
            groundsBacking: draft.groundsBacking ?? "",
            warrantBacking: draft.warrantBacking ?? "",
            qualifier: draft.qualifier ?? "",
            rebuttal: draft.rebuttal ?? "",
          },
          author: { _id: "", userId: "", name: "" },
          createdAt: new Date(draft.createdAt),
          updatedAt: new Date(draft.updatedAt),
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormChange = (data: ToulminArgument) => {
    setToulminArgument(data);
  };

  const handleSave = async () => {
    if (!toulminArgument || !resolvedData) {
      showError(commonT("error"), "No argument data to save");
      return;
    }

    setIsSaving(true);

    try {
      if (resolvedData.kind === "argument") {
        // Save as regular argument
        const success = await updateArgument(id, toulminArgument);
        
        if (success) {
          showSuccess(commonT("success"), t("saveSuccess"));
          router.push(`/argument/view/${id}`);
        }
      } else {
        // Save draft via server action (consolidated mutation path)
        const result = await updateDraftFromEditorAction(id, {
          name: toulminArgument.name,
          parts: toulminArgument.parts,
          version: resolvedData.draft?.version ?? 1,
        });

        if (!result.success) {
          throw new Error(result.error ?? "Failed to save draft");
        }

        showSuccess(commonT("success"), t("saveSuccess"));
        router.push(`/argument/view/${id}?draft=true`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      showError(commonT("error"), errorMessage);
    } finally {
      setIsSaving(false);
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

  const isDraft = resolvedData?.kind === "draft" || isDraftQuery;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="md:overflow-y-auto">
        {isDraft && (
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="yellow">{t("draft")}</Badge>
            <Typography variant="body-sm" textColor="muted">
              {t("draftEditingHint")}
            </Typography>
          </div>
        )}
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
