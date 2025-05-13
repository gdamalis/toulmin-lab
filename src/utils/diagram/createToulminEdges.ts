import { ToulminArgument } from "@/types/client";
import { Edge, MarkerType } from "@xyflow/react";

/**
 * Creates edges for a Toulmin argument diagram
 */
export function createToulminEdges(data: ToulminArgument): Edge[] {
  const baseEdges: Edge[] = [
    {
      id: "grounds-midpointQualifier",
      source: "grounds",
      target: "midpointQualifier",
      sourceHandle: "source-right",
      targetHandle: "midTarget-left",
      type: "straight",
      style: { stroke: "#000", strokeWidth: 3 },
      animated: false,
    },
    {
      id: "warrant-midpointQualifier",
      source: "warrant",
      target: "midpointQualifier",
      sourceHandle: "source-bottom",
      targetHandle: "midTarget-top",
      type: "straight",
      style: { stroke: "#000", strokeWidth: 3 },
      animated: false,
      markerEnd: {
        type: MarkerType.Arrow,
        color: "#000",
        strokeWidth: 2,
      },
    },
    {
      id: "midpointQualifier-qualifier",
      source: "midpointQualifier",
      target: "qualifier",
      sourceHandle: "midSource-right",
      targetHandle: "target-left",
      type: "straight",
      style: { stroke: "#000", strokeWidth: 3 },
      animated: false,
    },
    {
      id: "qualifier-midpointClaim",
      source: "qualifier",
      target: "midpointClaim",
      sourceHandle: "source-right",
      targetHandle: "midTarget-left",
      type: "straight",
      style: { stroke: "#000", strokeWidth: 3 },
      animated: false,
    },
    {
      id: "midpointClaim-claim",
      source: "midpointClaim",
      target: "claim",
      sourceHandle: "midSource-left",
      targetHandle: "target-right",
      type: "straight",
      style: { stroke: "#000", strokeWidth: 3 },
      animated: false,
    },
  ];

  // Add conditional edges if nodes exist
  if (data.parts.groundsBacking) {
    baseEdges.push({
      id: "groundsBacking-grounds",
      source: "groundsBacking",
      sourceHandle: "source-right",
      target: "grounds",
      targetHandle: "target-left",
      type: "straight",
      style: { stroke: "#000", strokeWidth: 3 },
      animated: false,
      markerEnd: {
        type: MarkerType.Arrow,
        color: "#000",
        strokeWidth: 2,
      },
    });
  }

  if (data.parts.warrantBacking) {
    baseEdges.push({
      id: "warrantBacking-warrant",
      source: "warrantBacking",
      target: "warrant",
      sourceHandle: "source-bottom",
      targetHandle: "target-top",
      animated: false,
      type: "straight",
      style: { stroke: "#000", strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.Arrow,
        color: "#000",
        strokeWidth: 2,
      },
    });
  }

  if (data.parts.rebuttal) {
    baseEdges.push({
      id: "rebuttal-midpointClaim",
      source: "rebuttal",
      target: "midpointClaim",
      sourceHandle: "source-top",
      targetHandle: "midTarget-bottom",
      animated: false,
      type: "straight",
      style: { stroke: "#000", strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.Arrow,
        color: "#000",
        strokeWidth: 2,
      },
    });
  }

  return baseEdges;
} 