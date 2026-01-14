"use client";

import { ExportButtonGroup } from "@/components/diagram/ExportButtonGroup";
import { TitlePanel } from "@/components/diagram/TitlePanel";
import { EXPORT_CONFIG } from "@/constants/toulmin-styles";
import { useImageExport } from "@/hooks";
import { useLayout } from "@/hooks";
import { useToulminGraph } from "@/hooks";
import { ToulminArgument } from "@/types/client";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef } from "react";

interface ToulminDiagramProps {
  readonly data: ToulminArgument;
  readonly showExportButtons?: boolean;
  readonly showControls?: boolean;
  readonly showTitle?: boolean;
  readonly fillContainer?: boolean;
}

const snapGrid: [number, number] = [6, 6];

function ToulminDiagram({
  data,
  showExportButtons = true,
  showControls = true,
  showTitle = true,
  fillContainer = false,
}: Readonly<ToulminDiagramProps>) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const { initialNodes, initialEdges, nodeTypes } = useToulminGraph(data);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const updatedNodes = useLayout();

  // Update nodes when initialNodes change (when data from form changes)
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const { exportAsPNG, exportAsJPG, exportAsPDF } =
    useImageExport(EXPORT_CONFIG);

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      flowRef.current = instance;
      window.requestAnimationFrame(() => {
        flowRef.current?.fitView({ padding: 0.1 });
      });
    },
    [flowRef]
  );

  useEffect(() => {
    if (updatedNodes.length > 0) {
      setNodes(updatedNodes);
    }
  }, [setNodes, updatedNodes]);

  return (
    <div className="space-y-4 h-full">
      {showExportButtons && (
        <ExportButtonGroup
          onExportPNG={exportAsPNG}
          onExportJPG={exportAsJPG}
          onExportPDF={exportAsPDF}
        />
      )}

      <div
        ref={diagramRef}
        aria-label="Toulmin argument diagram"
        className={fillContainer ? "h-full bg-white" : "h-150 bg-white"}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={snapGrid}
          fitView
          attributionPosition="bottom-right"
          onInit={onInit}
          minZoom={0.2}
          maxZoom={3}
          nodesDraggable={false}
        >
          {showTitle && <TitlePanel data={data} />}
          {showControls && <Controls showInteractive={false} />}
          <Background variant={BackgroundVariant.Dots} gap={12} />
        </ReactFlow>
      </div>
    </div>
  );
}

// Component with provider wrapper for easier use
export function ToulminDiagramWithProvider(
  props: Readonly<ToulminDiagramProps>
) {
  return (
    <ReactFlowProvider>
      <ToulminDiagram {...props} />
    </ReactFlowProvider>
  );
}
