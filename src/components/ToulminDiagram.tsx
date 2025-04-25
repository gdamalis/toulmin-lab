'use client';

import { useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ToulminArgument } from '@/types/toulmin';
import { EXPORT_CONFIG } from '@/constants/toulmin-styles';
import { useImageExport } from '@/hooks/useImageExport';
import { useToulminGraph } from '@/hooks/useToulminGraph';
import { ExportButtonGroup } from '@/components/diagram/ExportButtonGroup';

interface ToulminDiagramProps {
  data: ToulminArgument;
}

export function ToulminDiagram({ data }: ToulminDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const { nodes, edges } = useToulminGraph(data);
  const { exportAsPNG, exportAsJPG, exportAsPDF } = useImageExport(diagramRef, EXPORT_CONFIG);

  return (
    <div className="space-y-4">
      <ExportButtonGroup 
        onExportPNG={exportAsPNG}
        onExportJPG={exportAsJPG}
        onExportPDF={exportAsPDF}
      />
      
      <div 
        ref={diagramRef} 
        style={{ width: '100%', height: '600px', background: 'white' }}
        aria-label="Toulmin argument diagram"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
} 