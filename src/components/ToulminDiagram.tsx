'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { ToulminArgument } from '@/types/toulmin';

interface ToulminDiagramProps {
  data: ToulminArgument;
}

export function ToulminDiagram({ data }: ToulminDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null);

  const nodes: Node[] = [
    {
      id: 'claim',
      type: 'default',
      data: { label: `CLAIM:\n${data.claim}` },
      position: { x: 350, y: 100 },
      style: { background: '#e3f2fd', padding: '10px', borderRadius: '5px', width: 180 },
    },
    {
      id: 'grounds',
      type: 'default',
      data: { label: `GROUNDS:\n${data.grounds}` },
      position: { x: 100, y: 250 },
      style: { background: '#e8f5e9', padding: '10px', borderRadius: '5px', width: 180 },
    },
    {
      id: 'warrant',
      type: 'default',
      data: { label: `WARRANT:\n${data.warrant}` },
      position: { x: 350, y: 250 },
      style: { background: '#fff3e0', padding: '10px', borderRadius: '5px', width: 180 },
    },
    {
      id: 'qualifier',
      type: 'default',
      data: { label: `QUALIFIER:\n${data.qualifier}` },
      position: { x: 600, y: 250 },
      style: { background: '#e0f7fa', padding: '10px', borderRadius: '5px', width: 180 },
    },
  ];

  // Add conditional nodes if data exists
  if (data.groundsBacking) {
    nodes.push({
      id: 'groundsBacking',
      type: 'default',
      data: { label: `BACKING FOR GROUNDS:\n${data.groundsBacking}` },
      position: { x: 100, y: 400 },
      style: { background: '#f1f8e9', padding: '10px', borderRadius: '5px', width: 180 },
    });
  }

  if (data.warrantBacking) {
    nodes.push({
      id: 'warrantBacking',
      type: 'default',
      data: { label: `BACKING FOR WARRANT:\n${data.warrantBacking}` },
      position: { x: 350, y: 400 },
      style: { background: '#fff8e1', padding: '10px', borderRadius: '5px', width: 180 },
    });
  }

  if (data.rebuttal) {
    nodes.push({
      id: 'rebuttal',
      type: 'default',
      data: { label: `REBUTTAL:\n${data.rebuttal}` },
      position: { x: 600, y: 400 },
      style: { background: '#ffebee', padding: '10px', borderRadius: '5px', width: 180 },
    });
  }

  const edges: Edge[] = [
    { id: 'grounds-claim', source: 'grounds', target: 'claim', label: 'based on', animated: true },
    { id: 'warrant-grounds-claim', source: 'warrant', target: 'grounds-claim', label: 'because', animated: true },
    { id: 'qualifier-claim', source: 'qualifier', target: 'claim', label: 'with degree', animated: true },
  ];

  // Add conditional edges if nodes exist
  if (data.groundsBacking) {
    edges.push({ id: 'backing-grounds', source: 'groundsBacking', target: 'grounds', label: 'supports', animated: true });
  }

  if (data.warrantBacking) {
    edges.push({ id: 'backing-warrant', source: 'warrantBacking', target: 'warrant', label: 'supports', animated: true });
  }

  if (data.rebuttal) {
    edges.push({ id: 'rebuttal-claim', source: 'rebuttal', target: 'claim', label: 'unless', animated: true, type: 'straight' });
  }

  const handleDownloadPNG = useCallback(() => {
    if (diagramRef.current === null) return;
    
    toPng(diagramRef.current, { 
      backgroundColor: 'white',
      canvasWidth: 800,
      canvasHeight: 600 
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'toulmin-diagram.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error generating PNG:', error);
      });
  }, []);

  const handleDownloadJPG = useCallback(() => {
    if (diagramRef.current === null) return;
    
    toJpeg(diagramRef.current, { 
      backgroundColor: 'white',
      canvasWidth: 800,
      canvasHeight: 600,
      quality: 0.95
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'toulmin-diagram.jpg';
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error generating JPG:', error);
      });
  }, []);

  const handleDownloadPDF = useCallback(() => {
    if (diagramRef.current === null) return;
    
    toPng(diagramRef.current, { 
      backgroundColor: 'white',
      canvasWidth: 800,
      canvasHeight: 600
    })
      .then((dataUrl) => {
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        // Calculate positioning to center the image on the PDF
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pdfWidth - 20; // margins
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('toulmin-diagram.pdf');
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={handleDownloadPNG}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download PNG
        </button>
        <button
          onClick={handleDownloadJPG}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Download JPG
        </button>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Download PDF
        </button>
      </div>
      
      <div ref={diagramRef} style={{ width: '100%', height: '600px', background: 'white' }}>
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