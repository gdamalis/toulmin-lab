"use client";

import { DocumentArrowDownIcon, PhotoIcon } from "@heroicons/react/24/outline";

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
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      title={`Export as ${label}`}
    >
      {icon}
      <span>Export {label}</span>
    </button>
  );
}
