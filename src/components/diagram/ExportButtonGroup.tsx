"use client";

import { DocumentArrowDownIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics/track";
import { Button } from "../ui";

interface ExportButtonGroupProps {
  readonly onExportPNG: () => Promise<string | null | undefined>;
  readonly onExportJPG: () => Promise<string | null | undefined>;
  readonly onExportPDF: () => Promise<string | null | undefined>;
}

export function ExportButtonGroup({
  onExportPNG,
  onExportJPG,
  onExportPDF,
}: ExportButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <ExportButton
        onClick={onExportPNG}
        label="PNG"
        icon={<PhotoIcon className="w-4 h-4" />}
      />
      <ExportButton
        onClick={onExportJPG}
        label="JPG"
        icon={<PhotoIcon className="w-4 h-4" />}
      />
      <ExportButton
        onClick={onExportPDF}
        label="PDF"
        icon={<DocumentArrowDownIcon className="w-4 h-4" />}
      />
    </div>
  );
}

interface ExportButtonProps {
  readonly onClick: () => Promise<string | null | undefined>;
  readonly label: string;
  readonly icon: React.ReactNode;
}

function ExportButton({ onClick, label, icon }: Readonly<ExportButtonProps>) {
  const t = useTranslations("pages.argument");

  const handleClick = async () => {
    trackEvent("argument_export", { format: label.toLowerCase() });
    await onClick();
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="inline-flex items-center gap-1.5"
      title={t("exportAsFormat", { format: label })}
    >
      {icon}
      <span>
        {t("export")} {label}
      </span>
    </Button>
  );
}
