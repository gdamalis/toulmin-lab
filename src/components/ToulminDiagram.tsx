"use client";

import { ExportButtonGroup } from "@/components/diagram/ExportButtonGroup";
import { EXPORT_CONFIG } from "@/constants/toulmin-styles";
import { useImageExport } from "@/hooks/useImageExport";
import useLayout from "@/hooks/useLayout";
import { useToulminGraph } from "@/hooks/useToulminGraph";
import type { ToulminArgument } from "@/types/toulmin";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef } from "react";

interface ToulminDiagramProps {
  readonly data: ToulminArgument;
}

function ToulminDiagram({ data }: ToulminDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const { initialNodes, initialEdges, nodeTypes } = useToulminGraph(data);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const flowRef = useRef<ReactFlowInstance | null>(null);
  const updatedNodes = useLayout();

  const { exportAsPNG, exportAsJPG, exportAsPDF } = useImageExport(
    diagramRef,
    EXPORT_CONFIG
  );

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
    <div className="space-y-4">
      <ExportButtonGroup
        onExportPNG={exportAsPNG}
        onExportJPG={exportAsJPG}
        onExportPDF={exportAsPDF}
      />

      <div
        ref={diagramRef}
        aria-label="Toulmin argument diagram"
        className="overflow-hidden h-[600px] bg-white"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          onInit={onInit}
          minZoom={0.2}
          maxZoom={3}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}

function ToulminDiagramWithProvider({ data }: ToulminDiagramProps) {
  return (
    <ReactFlowProvider>
      <ToulminDiagram data={data} />
    </ReactFlowProvider>
  );
}

export default ToulminDiagramWithProvider;
