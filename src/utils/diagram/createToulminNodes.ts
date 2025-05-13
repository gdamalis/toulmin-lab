import { NODE_STYLES } from "@/constants/toulmin-styles";
import { ToulminArgument } from "@/types/client";
import { Node } from "@xyflow/react";

/**
 * Creates nodes for a Toulmin argument diagram
 */
export function createToulminNodes(
  data: ToulminArgument,
  translations: Record<string, string>
): Node[] {
  return [
    {
      id: "groundsBacking",
      type: "element",
      data: {
        label: data.parts.groundsBacking,
        title: translations.evidenceBacking,
      },
      position: { x: 0, y: 400 },
      style: NODE_STYLES.groundsBacking,
    },
    {
      id: "grounds",
      type: "element",
      data: { 
        label: data.parts.grounds, 
        title: translations.evidence 
      },
      position: { x: 270, y: 400 },
      style: NODE_STYLES.grounds,
    },
    {
      id: "warrantBacking",
      type: "element",
      data: {
        label: data.parts.warrantBacking,
        title: translations.backing,
      },
      position: { x: 450, y: 0 },
      style: NODE_STYLES.warrantBacking,
    },
    {
      id: "warrant",
      type: "element",
      data: { 
        label: data.parts.warrant, 
        title: translations.warrant 
      },
      position: { x: 450, y: 200 },
      style: NODE_STYLES.warrant,
    },
    {
      id: "midpointQualifier",
      data: { label: "", title: "" },
      position: { x: 550, y: 450 },
      type: "midpoint",
      style: NODE_STYLES.midpointQualifier,
    },
    {
      id: "qualifier",
      type: "element",
      data: { 
        label: data.parts.qualifier, 
        title: translations.qualifier 
      },
      position: { x: 650, y: 400 },
      style: NODE_STYLES.qualifier,
    },
    {
      id: "midpointClaim",
      data: { label: "", title: "" },
      position: { x: 950, y: 450 },
      type: "midpoint",
      style: NODE_STYLES.midpointClaim,
    },
    {
      id: "claim",
      type: "element",
      data: { 
        label: data.parts.claim, 
        title: translations.claim 
      },
      position: { x: 1150, y: 400 },
      style: NODE_STYLES.claim,
    },
    {
      id: "rebuttal",
      type: "element",
      data: { 
        label: data.parts.rebuttal, 
        title: translations.rebuttal 
      },
      position: { x: 950, y: 600 },
      style: NODE_STYLES.rebuttal,
    },
  ];
} 