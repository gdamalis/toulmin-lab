'use client';

interface ExportButtonGroupProps {
  readonly onExportPNG: () => void;
  readonly onExportJPG: () => void;
  readonly onExportPDF: () => void;
}

export function ExportButtonGroup({
  onExportPNG,
  onExportJPG,
  onExportPDF,
}: ExportButtonGroupProps) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onExportPNG}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Download diagram as PNG"
      >
        Download PNG
      </button>
      <button
        onClick={onExportJPG}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        aria-label="Download diagram as JPG"
      >
        Download JPG
      </button>
      <button
        onClick={onExportPDF}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        aria-label="Download diagram as PDF"
      >
        Download PDF
      </button>
    </div>
  );
} 