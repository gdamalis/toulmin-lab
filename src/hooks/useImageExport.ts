import { RefObject, useCallback } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface ExportConfig {
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
}

export function useImageExport<T extends HTMLElement>(ref: RefObject<T | null>, config: ExportConfig) {
  const handleExportImage = useCallback((format: 'png' | 'jpeg' | 'pdf') => {
    if (!ref.current) return;
    
    const exportConfig = {
      ...config,
      quality: format === 'jpeg' ? 0.95 : undefined,
    };
    
    const processImage = format === 'png' ? toPng : toJpeg;
    
    return processImage(ref.current, exportConfig)
      .then((dataUrl) => {
        if (format === 'pdf') {
          const pdf = new jsPDF('landscape', 'mm', 'a4');
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const imgWidth = pdfWidth - 20;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          
          pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save('toulmin-diagram.pdf');
          return dataUrl;
        } else {
          const link = document.createElement('a');
          link.download = `toulmin-diagram.${format}`;
          link.href = dataUrl;
          link.click();
          return dataUrl;
        }
      })
      .catch((error) => {
        console.error(`Error generating ${format.toUpperCase()}:`, error);
        return null;
      });
  }, [ref, config]);

  return {
    exportAsPNG: useCallback(() => handleExportImage('png'), [handleExportImage]),
    exportAsJPG: useCallback(() => handleExportImage('jpeg'), [handleExportImage]),
    exportAsPDF: useCallback(() => handleExportImage('pdf'), [handleExportImage]),
  };
} 