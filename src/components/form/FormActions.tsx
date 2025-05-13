"use client";

import { Button } from "@/components/ui/Button";
import { ArrowPathIcon, CloudArrowUpIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { MouseEvent } from "react";

interface FormActionsProps {
  onSampleData: (e: MouseEvent<HTMLButtonElement>) => void;
  onClearForm: (e: MouseEvent<HTMLButtonElement>) => void;
  lastSaved: Date | null;
  isOnline: boolean;
}

export function FormActions({
  onSampleData,
  onClearForm,
  lastSaved,
  isOnline,
}: Readonly<FormActionsProps>) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onSampleData}
          title={t("loadSampleTooltip")}
        >
          <DocumentDuplicateIcon className="w-4 h-4 mr-1.5" />
          <span>{t("useSample")}</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClearForm}
        >
          <ArrowPathIcon className="w-4 h-4 mr-1.5" />
          <span>{commonT("clear")}</span>
        </Button>
      </div>
      
      {lastSaved && (
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <CloudArrowUpIcon className="w-4 h-4 mr-1" />
          <span>
            {isOnline 
              ? commonT("lastSaved", { 
                  time: lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                })
              : commonT("offlineDraftSaved")}
          </span>
        </div>
      )}
    </div>
  );
} 