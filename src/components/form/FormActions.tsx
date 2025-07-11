"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { ArrowPathIcon, CloudArrowUpIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { MouseEvent } from "react";

interface FormActionsProps {
  onSampleData: (e: MouseEvent<HTMLButtonElement>) => void;
  onClearForm: (e: MouseEvent<HTMLButtonElement>) => void;
  lastSaved: Date | null;
  isOnline: boolean;
  isUserSignedIn: boolean;
}

export function FormActions({
  onSampleData,
  onClearForm,
  lastSaved,
  isOnline,
  isUserSignedIn,
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
      
      {/* Status messages */}
      <div className="flex flex-col mt-2 text-xs">
        {lastSaved && (
          <div className="flex items-center text-gray-500">
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
        
        {!isOnline && (
          <Typography textColor="warning" className="mt-1 text-sm">
            {commonT("offlineWarning")}
          </Typography>
        )}
        
        {!isUserSignedIn && (
          <Typography textColor="warning" className="mt-1 text-sm">
            {t("signInToSave")}
          </Typography>
        )}
      </div>
    </div>
  );
} 