import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { ToulminArgument } from '@/types/toulmin';
import { NODE_STYLES } from '@/constants/toulmin-styles';

export function useToulminGraph(data: ToulminArgument) {
  const nodes: Node[] = useMemo(() => {
    const baseNodes: Node[] = [
      {
        id: 'claim',
        type: 'default',
        data: { label: `CLAIM:\n${data.claim}` },
        position: { x: 350, y: 100 },
        style: NODE_STYLES.claim,
      },
      {
        id: 'grounds',
        type: 'default',
        data: { label: `GROUNDS:\n${data.grounds}` },
        position: { x: 100, y: 250 },
        style: NODE_STYLES.grounds,
      },
      {
        id: 'warrant',
        type: 'default',
        data: { label: `WARRANT:\n${data.warrant}` },
        position: { x: 350, y: 250 },
        style: NODE_STYLES.warrant,
      },
      {
        id: 'qualifier',
        type: 'default',
        data: { label: `QUALIFIER:\n${data.qualifier}` },
        position: { x: 600, y: 250 },
        style: NODE_STYLES.qualifier,
      },
    ];

    // Add conditional nodes if data exists
    if (data.groundsBacking) {
      baseNodes.push({
        id: 'groundsBacking',
        type: 'default',
        data: { label: `BACKING FOR GROUNDS:\n${data.groundsBacking}` },
        position: { x: 100, y: 400 },
        style: NODE_STYLES.groundsBacking,
      });
    }

    if (data.warrantBacking) {
      baseNodes.push({
        id: 'warrantBacking',
        type: 'default',
        data: { label: `BACKING FOR WARRANT:\n${data.warrantBacking}` },
        position: { x: 350, y: 400 },
        style: NODE_STYLES.warrantBacking,
      });
    }

    if (data.rebuttal) {
      baseNodes.push({
        id: 'rebuttal',
        type: 'default',
        data: { label: `REBUTTAL:\n${data.rebuttal}` },
        position: { x: 600, y: 400 },
        style: NODE_STYLES.rebuttal,
      });
    }

    return baseNodes;
  }, [data]);

  const edges: Edge[] = useMemo(() => {
    const baseEdges: Edge[] = [
      { id: 'grounds-claim', source: 'grounds', target: 'claim', label: 'based on', animated: true },
      { id: 'warrant-grounds-claim', source: 'warrant', target: 'grounds-claim', label: 'because', animated: true },
      { id: 'qualifier-claim', source: 'qualifier', target: 'claim', label: 'with degree', animated: true },
    ];

    // Add conditional edges if nodes exist
    if (data.groundsBacking) {
      baseEdges.push({ 
        id: 'backing-grounds', 
        source: 'groundsBacking', 
        target: 'grounds', 
        label: 'supports', 
        animated: true 
      });
    }

    if (data.warrantBacking) {
      baseEdges.push({ 
        id: 'backing-warrant', 
        source: 'warrantBacking', 
        target: 'warrant', 
        label: 'supports', 
        animated: true 
      });
    }

    if (data.rebuttal) {
      baseEdges.push({ 
        id: 'rebuttal-claim', 
        source: 'rebuttal', 
        target: 'claim', 
        label: 'unless', 
        animated: true, 
        type: 'straight' 
      });
    }

    return baseEdges;
  }, [data]);

  return { nodes, edges };
} 