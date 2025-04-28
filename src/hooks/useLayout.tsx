import { useReactFlow, useNodesInitialized, Node } from "@xyflow/react";
import { useEffect, useState } from "react";

// Configuration constants
const FLOW_OPTIONS = {
  includeHiddenNodes: false,
};

const LAYOUT_CONFIG = {
  spacing: 100,
  nodeWidth: 250,
  threshold: 23,
  heightOffset: 2,
};

// Type definitions
type ToulminArgumentLayoutMap = Record<string, string[]>;
type NodeMap = Record<string, Node>;

// Layout structure definition
const ARGUMENT_LAYOUT: ToulminArgumentLayoutMap = {
  main: [
    "groundsBacking",
    "grounds",
    "midpointQualifier",
    "qualifier",
    "midpointClaim",
    "claim",
  ],
  midpointQualifier: ["warrantBacking", "warrant"],
  midpointClaim: ["rebuttal"],
};

/**
 * Creates a map of node IDs to node objects for efficient lookup
 */
const createNodeMap = (nodes: Node[]): NodeMap => {
  return nodes.reduce<NodeMap>((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});
};

/**
 * Gets a node's dimension safely with fallback to 0
 */
const getNodeDimension = (
  node: Node | undefined,
  dimension: "width" | "height"
): number => {
  return node?.measured?.[dimension] ?? 0;
};

/**
 * Calculates the maximum height among a set of nodes
 */
const getMaxHeight = (nodeMap: NodeMap, nodeIds: string[]): number => {
  return Math.max(
    ...nodeIds.map((id) => getNodeDimension(nodeMap[id], "height"))
  );
};

/**
 * Positions warrant-related nodes (warrantBacking and warrant)
 */
const positionWarrantNodes = (
  nodeMap: NodeMap,
  { spacing, threshold }: typeof LAYOUT_CONFIG
): Node[] => {
  const warrantBacking = nodeMap.warrantBacking;
  const warrant = nodeMap.warrant;
  const groundsBackingWidth = getNodeDimension(nodeMap.groundsBacking, "width");
  const groundsWidth = getNodeDimension(nodeMap.grounds, "width");
  const warrantBackingHeight = getNodeDimension(warrantBacking, "height");

  const baseX = groundsBackingWidth + groundsWidth + spacing - threshold;

  const updatedNodes: Node[] = [];

  if (warrantBacking) {
    updatedNodes.push({
      ...warrantBacking,
      position: { x: baseX, y: 0 },
    });
  }

  if (warrant) {
    updatedNodes.push({
      ...warrant,
      position: {
        x: baseX,
        y: warrantBackingHeight + spacing,
      },
    });
  }

  return updatedNodes;
};

/**
 * Positions the rebuttal node
 */
const positionRebuttalNode = (
  nodeMap: NodeMap,
  { spacing, nodeWidth, threshold }: typeof LAYOUT_CONFIG
): Node[] => {
  const rebuttal = nodeMap.rebuttal;
  if (!rebuttal) return [];

  const mainNodesMaxHeight = getMaxHeight(nodeMap, [
    "groundsBacking",
    "grounds",
    "qualifier",
    "claim",
  ]);

  const warrantBackingHeight = getNodeDimension(
    nodeMap.warrantBacking,
    "height"
  );
  const warrantHeight = getNodeDimension(nodeMap.warrant, "height");

  return [
    {
      ...rebuttal,
      position: {
        x: (nodeWidth + spacing) * 3 - threshold,
        y:
          mainNodesMaxHeight +
          warrantBackingHeight +
          warrantHeight +
          spacing * 3,
      },
    },
  ];
};

/**
 * Positions main argument nodes (grounds, claim, etc.)
 */
const positionMainNodes = (
  nodeMap: NodeMap,
  { spacing, nodeWidth, heightOffset }: typeof LAYOUT_CONFIG
): Node[] => {
  const updatedNodes: Node[] = [];
  const mainNodesMaxHeight = getMaxHeight(nodeMap, [
    "groundsBacking",
    "grounds",
    "qualifier",
    "claim",
  ]);

  const warrantBackingHeight = getNodeDimension(
    nodeMap.warrantBacking,
    "height"
  );
  const warrantHeight = getNodeDimension(nodeMap.warrant, "height");

  ARGUMENT_LAYOUT.main.forEach((nodeId, index) => {
    const node = nodeMap[nodeId];
    if (!node) return;

    let height = 0;
    let x = index * (nodeWidth + spacing);

    if (node.type === "midpoint") {
      height = mainNodesMaxHeight / 2 - heightOffset;
    } else if (mainNodesMaxHeight !== node.measured?.height) {
      height = (mainNodesMaxHeight - (node.measured?.height ?? 0)) / 2;
    }

    if (node.id === "midpointQualifier") {
      x = index * (nodeWidth + spacing);
    } else if (node.id === "qualifier") {
      x = 2 * nodeWidth + index * spacing;
    } else if (node.id === "midpointClaim") {
      x = 3 * nodeWidth + index * spacing;
    } else if (node.id === "claim") {
      x = 3 * nodeWidth + index * spacing;
    }

    updatedNodes.push({
      ...node,
      position: {
        x,
        y: height + warrantBackingHeight + warrantHeight + spacing * 2,
      },
    });
  });

  return updatedNodes;
};

/**
 * Updates the positions of all nodes in the argument layout
 */
const updateNodesPositions = (nodes: Node[]): Node[] => {
  const nodeMap = createNodeMap(nodes);

  const warrantNodes = positionWarrantNodes(nodeMap, LAYOUT_CONFIG);
  const rebuttalNode = positionRebuttalNode(nodeMap, LAYOUT_CONFIG);
  const mainNodes = positionMainNodes(nodeMap, LAYOUT_CONFIG);

  return [...warrantNodes, ...rebuttalNode, ...mainNodes];
};

/**
 * Custom hook for managing Toulmin argument layout
 */
export default function useLayout() {
  const { getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized(FLOW_OPTIONS);
  const [nodes, setNodes] = useState(getNodes());

  useEffect(() => {
    if (nodesInitialized) {
      setNodes(updateNodesPositions(getNodes()));
    }
  }, [nodesInitialized, getNodes]);

  return nodes;
}
