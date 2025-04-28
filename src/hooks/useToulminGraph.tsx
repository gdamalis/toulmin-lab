import { NODE_STYLES } from "@/constants/toulmin-styles";
import { ToulminArgument } from "@/types/client";
import {
  type Edge,
  Handle,
  MarkerType,
  type Node,
  Position,
} from "@xyflow/react";
import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";

const MidpointNode = memo(() => (
  <div style={{ width: 0, height: 0 }}>
    <Handle
      type="target"
      id="midTarget-left"
      position={Position.Left}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <Handle
      type="target"
      id="midTarget-right"
      position={Position.Right}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <Handle
      type="target"
      id="midTarget-top"
      position={Position.Top}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <Handle
      type="target"
      id="midTarget-bottom"
      position={Position.Bottom}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <Handle
      type="source"
      id="midSource-left"
      position={Position.Left}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <Handle
      type="source"
      id="midSource-right"
      position={Position.Right}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <Handle
      type="source"
      id="midSource-top"
      position={Position.Top}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <Handle
      type="source"
      id="midSource-bottom"
      position={Position.Bottom}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
  </div>
));

MidpointNode.displayName = "MidpointNode";

const ElementNode = memo(
  ({ data }: { data: { label: string; title: string } }) => {
    return (
      <div className="node-content">
        {/* Simplify to just have handles on the needed sides based on node position */}
        <Handle
          style={{ backgroundColor: "#999" }}
          type="source"
          position={Position.Top}
          id="source-top"
        />
        <Handle
          style={{ backgroundColor: "#999" }}
          type="source"
          position={Position.Bottom}
          id="source-bottom"
        />
        <Handle
          style={{ backgroundColor: "#999" }}
          type="source"
          position={Position.Left}
          id="source-left"
        />
        <Handle
          style={{ backgroundColor: "#999" }}
          type="source"
          position={Position.Right}
          id="source-right"
        />
        <Handle
          style={{ backgroundColor: "#999" }}
          type="target"
          position={Position.Top}
          id="target-top"
        />
        <Handle
          style={{ backgroundColor: "#999" }}
          type="target"
          position={Position.Bottom}
          id="target-bottom"
        />
        <Handle
          style={{ backgroundColor: "#999" }}
          type="target"
          position={Position.Left}
          id="target-left"
        />
        <Handle
          style={{ backgroundColor: "#999" }}
          type="target"
          position={Position.Right}
          id="target-right"
        />

        <div className="node-title">{data.title}</div>
        <div className="node-text">{data.label}</div>
      </div>
    );
  }
);

ElementNode.displayName = "ElementNode";

const nodeTypes = {
  element: ElementNode,
  midpoint: MidpointNode,
};

export function useToulminGraph(data: ToulminArgument) {
  const t = useTranslations("pages.argument");
  
  const initialNodes: Node[] = useMemo(() => {
    const baseNodes: Node[] = [
      {
        id: "groundsBacking",
        type: "element",
        data: {
          label: data.parts.groundsBacking,
          title: t("evidenceBacking"),
        },
        position: { x: 0, y: 400 },
        style: NODE_STYLES.groundsBacking,
      },

      {
        id: "grounds",
        type: "element",
        data: { label: data.parts.grounds, title: t("evidence") },
        position: { x: 270, y: 400 },
        style: NODE_STYLES.grounds,
      },
      {
        id: "warrantBacking",
        type: "element",
        data: {
          label: data.parts.warrantBacking,
          title: t("backing"),
        },
        position: { x: 450, y: 0 },
        style: NODE_STYLES.warrantBacking,
      },
      {
        id: "warrant",
        type: "element",
        data: { label: data.parts.warrant, title: t("warrant") },
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
        data: { label: data.parts.qualifier, title: t("qualifier") },
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
        data: { label: data.parts.claim, title: t("claim") },
        position: { x: 1150, y: 400 },
        style: NODE_STYLES.claim,
      },
      {
        id: "rebuttal",
        type: "element",
        data: { label: data.parts.rebuttal, title: t("rebuttal") },
        position: { x: 950, y: 600 },
        style: NODE_STYLES.rebuttal,
      },
    ];

    return baseNodes;
  }, [data, t]);

  const initialEdges: Edge[] = useMemo(() => {
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
  }, [data]);

  return { initialNodes, initialEdges, nodeTypes };
}
