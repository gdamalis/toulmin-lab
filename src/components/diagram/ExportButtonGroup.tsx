'use client';

import { Button } from '@/components/ui/Button';

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
      <Button 
        onClick={onExportPNG}
        variant="blue"
        aria-label="Download diagram as PNG"
      >
        Download PNG
      </Button>
      <Button
        onClick={onExportJPG}
        variant="green"
        aria-label="Download diagram as JPG"
      >
        Download JPG
      </Button>
      <Button
        onClick={onExportPDF}
        variant="purple"
        aria-label="Download diagram as PDF"
      >
        Download PDF
      </Button>
    </div>
  );
} 