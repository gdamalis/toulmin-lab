"use client";

import { ArgumentList, DeleteArgumentModal } from "@/components/dashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { useArgumentOverview } from "@/hooks";
import { useCoachQuota } from "@/hooks";
import { ToulminArgument } from "@/types/client";
import { DraftOverview } from "@/lib/services/coach";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";

type DeleteTarget =
  | { type: "argument"; item: ToulminArgument }
  | { type: "draft"; item: DraftOverview };

export default function ArgumentsPage() {
  const t = useTranslations("pages.argument");
  const coachT = useTranslations("pages.coach");
  
  const {
    toulminArguments,
    drafts,
    isLoading,
    error,
    deleteArgument,
    deleteDraft,
    isDeletingArgument,
    isDeletingDraft,
  } = useArgumentOverview();
  
  const { canUseAI, quotaStatus } = useCoachQuota();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Generate tooltip text for disabled AI button
  const aiButtonTooltip = useMemo(() => {
    if (canUseAI || !quotaStatus) return undefined;
    
    const resetDate = new Date(quotaStatus.resetAt);
    const resetDateStr = resetDate.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
    
    return coachT('error.monthlyQuotaExceeded', { resetDate: resetDateStr });
  }, [canUseAI, quotaStatus, coachT]);

  const handleOpenDeleteModal = (item: ToulminArgument | DraftOverview, type: "argument" | "draft") => {
    setDeleteTarget({ type, item } as DeleteTarget);
    setIsDeleteModalOpen(true);
  };
  
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };
  
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    let success = false;
    if (deleteTarget.type === "argument") {
      const argId = (deleteTarget.item as ToulminArgument)._id?.toString();
      if (argId) {
        success = await deleteArgument(argId);
      }
    } else {
      const sessionId = (deleteTarget.item as DraftOverview).sessionId;
      success = await deleteDraft(sessionId);
    }
    
    if (success) handleCloseDeleteModal();
  };

  const getDeleteTargetName = (): string => {
    if (!deleteTarget) return t("untitled");
    if (deleteTarget.type === "argument") {
      return (deleteTarget.item as ToulminArgument).name || t("untitled");
    }
    return (deleteTarget.item as DraftOverview).name || t("untitled");
  };

  return (
    <>
      <PageHeader
        title={t("myArguments")}
        buttons={[
          {
            text: t("newArgument"),
            href: "/argument/create",
            variant: "primary",
          },
          {
            text: t("createWithAI"),
            href: "/argument/coach",
            variant: "secondary",
            icon: SparklesIcon,
            disabled: !canUseAI,
            tooltip: aiButtonTooltip,
          },
        ]}
      />
      
      <ArgumentList 
        arguments={toulminArguments}
        drafts={drafts}
        isLoading={isLoading}
        error={error}
        onDeleteArgument={(arg) => handleOpenDeleteModal(arg, "argument")}
        onDeleteDraft={(draft) => handleOpenDeleteModal(draft, "draft")}
        canUseAI={canUseAI}
        aiDisabledTooltip={aiButtonTooltip}
      />

      {/* Delete confirmation modal */}
      <DeleteArgumentModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
        argumentName={getDeleteTargetName()}
        isDeleting={isDeletingArgument || isDeletingDraft}
      />
    </>
  );
}
