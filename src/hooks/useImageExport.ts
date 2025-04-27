import { getNodesBounds, useReactFlow } from "@xyflow/react";
import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useCallback } from "react";

export interface ExportConfig {
  backgroundColor: string;
}

export function useImageExport(config: ExportConfig) {
  const { getNodes } = useReactFlow();

  const handleExportImage = useCallback(
    async (format: "png" | "jpeg" | "pdf") => {
      const nodesBounds = getNodesBounds(getNodes());
      
      // Get the entire ReactFlow container which includes the panels
      const reactFlowContainer = document.querySelector(
        ".react-flow"
      ) as HTMLElement;
      
      if (!reactFlowContainer) return;

      // Get the viewport for transforming
      const flowViewport = document.querySelector(
        ".react-flow__viewport"
      ) as HTMLElement;
      
      if (!flowViewport) return;

      // Store original visibility states for all elements we'll modify
      const elementsToHide = reactFlowContainer.querySelectorAll<HTMLElement>(
        ".react-flow__controls, .react-flow__background, .react-flow__minimap"
      );
      
      // Save original display values and hide elements that shouldn't be in export
      const originalDisplayValues = new Map<HTMLElement, string>();
      elementsToHide.forEach(element => {
        originalDisplayValues.set(element, element.style.display);
        element.style.display = "none";
      });

      // Store original styles for container and viewport
      const originalContainerStyle = reactFlowContainer.getAttribute("style");
      const originalViewportStyle = flowViewport.getAttribute("style");

      // Calculate size with extra padding for the panel
      const padding = 40; // Increased padding to accommodate the panel
      const width = nodesBounds.width + padding * 2;
      const height = nodesBounds.height + padding * 2;

      // Set container dimensions
      reactFlowContainer.style.width = `${width}px`;
      reactFlowContainer.style.height = `${height}px`;
      
      // Transform the viewport to position nodes correctly
      flowViewport.style.transform = `translate(${
        -nodesBounds.x + padding
      }px, ${-nodesBounds.y + padding}px) scale(1)`;

      try {
        const processImage = format === "png" ? toPng : toJpeg;

        // Use the entire container for the export
        const dataUrl = await processImage(reactFlowContainer, {
          backgroundColor: config.backgroundColor,
          pixelRatio: 2,
          style: {
            width: `${width}px`,
            height: `${height}px`,
          },
          filter: (node) => {
            // Keep elements that have the data-export-include attribute or are part of the diagram
            const isUIControl = 
              node.classList?.contains("react-flow__controls") ||
              node.classList?.contains("react-flow__background") ||
              node.classList?.contains("react-flow__minimap");
              
            return !isUIControl || node.hasAttribute("data-export-include");
          },
        });

        const getTitleElement = () => reactFlowContainer.querySelector<HTMLElement>(
          '[data-export-include="true"] h3'
        );

        if (format === "pdf") {
          const pdf = new jsPDF({
            orientation: width > height ? "landscape" : "portrait",
            unit: "px",
            format: [width, height],
          });
          pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
          
          // Use the argument name from the title panel if available
          const titleElement = getTitleElement();
          const filename = titleElement?.textContent?.trim() 
            ? `${titleElement.textContent.trim()}.pdf`
            : "toulmin-argument-diagram.pdf";
            
          pdf.save(filename);
        } else {
          const link = document.createElement("a");
          
          // Use the argument name from the title panel if available
          const titleElement = getTitleElement();
          const filename = titleElement?.textContent?.trim() 
            ? `${titleElement.textContent.trim()}.${format}`
            : `toulmin-argument-diagram.${format}`;
            
          link.download = filename;
          link.href = dataUrl;
          link.click();
        }

        return dataUrl;
      } catch (error) {
        console.error(`Error generating ${format.toUpperCase()}:`, error);
        return null;
      } finally {
        // Restore original styles for the container and viewport
        if (originalContainerStyle !== null) {
          reactFlowContainer.setAttribute("style", originalContainerStyle);
        } else {
          reactFlowContainer.removeAttribute("style");
        }
        
        if (originalViewportStyle !== null) {
          flowViewport.setAttribute("style", originalViewportStyle);
        } else {
          flowViewport.removeAttribute("style");
        }

        // Restore visibility of all hidden elements
        elementsToHide.forEach((element) => {
          const originalDisplay = originalDisplayValues.get(element);
          element.style.display = originalDisplay ?? "";
        });
      }
    },
    [config, getNodes]
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
