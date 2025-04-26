import { getNodesBounds, useReactFlow } from "@xyflow/react";
import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useCallback } from "react";

export interface ExportConfig {
  backgroundColor: string;
}

export function useImageExport(config: ExportConfig) {
  const { getNodes } = useReactFlow();

  const nodesBounds = getNodesBounds(getNodes());

  const handleExportImage = useCallback(
    async (format: "png" | "jpeg" | "pdf") => {
      const flowViewport = document.querySelector(
        ".react-flow__viewport"
      ) as HTMLElement;
      if (!flowViewport) return;

      // Store original style
      const originalStyle = flowViewport.getAttribute("style");

      // Calculate size
      const padding = 20; // Optional: extra padding around nodes
      const width = nodesBounds.width + padding * 2;
      const height = nodesBounds.height + padding * 2;

      // Temporarily apply new size and reset transform
      flowViewport.style.width = `${width}px`;
      flowViewport.style.height = `${height}px`;
      flowViewport.style.transform = `translate(${
        -nodesBounds.x + padding
      }px, ${-nodesBounds.y + padding}px) scale(1)`;

      try {
        const processImage = format === "png" ? toPng : toJpeg;

        const dataUrl = await processImage(flowViewport, {
          backgroundColor: config.backgroundColor,
          pixelRatio: 2,
        });

        if (format === "pdf") {
          const pdf = new jsPDF({
            orientation: width > height ? "landscape" : "portrait",
            unit: "px",
            format: [width, height],
          });
          pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
          pdf.save("toulmin-argument-diagram.pdf");
        } else {
          const link = document.createElement("a");
          link.download = `toulmin-argument-diagram.${format}`;
          link.href = dataUrl;
          link.click();
        }

        return dataUrl;
      } catch (error) {
        console.error(`Error generating ${format.toUpperCase()}:`, error);
        return null;
      } finally {
        // Restore original style
        if (originalStyle !== null) {
          flowViewport.setAttribute("style", originalStyle);
        } else {
          flowViewport.removeAttribute("style");
        }
      }
    },
    [config, nodesBounds]
  );

  return {
    exportAsPNG: useCallback(
      () => handleExportImage("png"),
      [handleExportImage]
    ),
    exportAsJPG: useCallback(
      () => handleExportImage("jpeg"),
      [handleExportImage]
    ),
    exportAsPDF: useCallback(
      () => handleExportImage("pdf"),
      [handleExportImage]
    ),
  };
}
