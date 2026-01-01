"use client";

import { ToulminDiagram } from "@/components/diagram";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui";
import { Typography } from "@/components/ui/Typography";
import { ToulminArgument } from "@/types/client";
import { ClientArgumentDraft } from "@/types/coach";
import { getCurrentUserToken } from "@/lib/auth/utils";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface ResolvedData {
  kind: "argument" | "draft";
  argument?: ToulminArgument;
  draft?: ClientArgumentDraft;
}

export default function ToulminArgumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");
  
  const [resolvedData, setResolvedData] = useState<ResolvedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Convert draft to ToulminArgument format for the diagram
  const getToulminArgument = (): ToulminArgument | null => {
    if (!resolvedData) return null;
    
    if (resolvedData.kind === "argument" && resolvedData.argument) {
      return resolvedData.argument;
    }
    
    if (resolvedData.kind === "draft" && resolvedData.draft) {
      const draft = resolvedData.draft;
      return {
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
      };
    }
    
    return null;
  };

  const handleEdit = () => {
    if (resolvedData?.kind === "draft") {
      router.push(`/argument/edit/${id}?draft=true`);
    } else {
      router.push(`/argument/edit/${id}`);
    }
  };

  const handleEditWithAI = () => {
    // For drafts, sessionId is the id
    // For arguments, we'd need to create a new session - for now redirect to coach
    if (resolvedData?.kind === "draft") {
      router.push(`/argument/coach/${id}`);
    } else {
      router.push(`/argument/coach`);
    }
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

    const toulminArgument = getToulminArgument();
    if (toulminArgument) {
      return <ToulminDiagram data={toulminArgument} />;
    }

    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        <Typography textColor="muted">{t("diagramNotFound")}</Typography>
      </div>
    );
  };

  const pageTitle = (() => {
    if (resolvedData?.kind === "argument" && resolvedData.argument) {
      return resolvedData.argument.name || `${t("diagram")} ${id.substring(0, 8)}`;
    }
    if (resolvedData?.kind === "draft" && resolvedData.draft) {
      return resolvedData.draft.name || `${t("diagram")} ${id.substring(0, 8)}`;
    }
    return `${t("diagram")} ${id.substring(0, 8)}`;
  })();

  const updatedAt = (() => {
    if (resolvedData?.kind === "argument" && resolvedData.argument) {
      return new Date(resolvedData.argument.updatedAt).toLocaleString();
    }
    if (resolvedData?.kind === "draft" && resolvedData.draft) {
      return new Date(resolvedData.draft.updatedAt).toLocaleString();
    }
    return null;
  })();

  const isDraft = resolvedData?.kind === "draft" || isDraftQuery;

  const headerButtons = isDraft
    ? [
        {
          text: t("editDiagram"),
          onClick: handleEdit,
          variant: "secondary" as const,
        },
        {
          text: t("continueWithAI"),
          onClick: handleEditWithAI,
          variant: "primary" as const,
          icon: SparklesIcon,
        },
      ]
    : [
        {
          text: t("editDiagram"),
          onClick: handleEdit,
          variant: "primary" as const,
        },
        {
          text: t("editWithAI"),
          onClick: handleEditWithAI,
          variant: "secondary" as const,
          icon: SparklesIcon,
        },
      ];

  return (
    <div className="mx-auto max-w-8xl pb-12">
      <div className="flex flex-col gap-4 mb-6">
        <PageHeader title={pageTitle} buttons={headerButtons}>
          <div className="flex items-center gap-2 mt-1">
            {isDraft && <Badge variant="yellow">{t("draft")}</Badge>}
            {updatedAt && (
              <Typography textColor="muted">
                {t("lastUpdated")}: {updatedAt}
              </Typography>
            )}
          </div>
        </PageHeader>
      </div>

      {renderContent()}
    </div>
  );
}
