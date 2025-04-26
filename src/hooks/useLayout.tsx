import { useReactFlow, useNodesInitialized, Node } from "@xyflow/react";
import { useEffect, useState } from "react";

const options = {
  includeHiddenNodes: false,
};
const argumentLayout = {
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

const updateNodesPositions = (nodes: Node[]) => {
  const updatedNodes: Node[] = [];
  const spacing = 145;
  const width = 250;

  const groundsBackingWidth =
    nodes.find((node) => node.id === "groundsBacking")?.measured?.width ?? 0;

  const groundsWidth =
    nodes.find((node) => node.id === "grounds")?.measured?.width ?? 0;

  const warrantBackingHeight =
    nodes.find((node) => node.id === "warrantBacking")?.measured?.height ?? 0;

  const warrantHeight =
    nodes.find((node) => node.id === "warrant")?.measured?.height ?? 0;

  const groundsBacking = nodes.find(
    (node) => node.id === "groundsBacking"
  ) as Node;
  const grounds = nodes.find((node) => node.id === "grounds") as Node;
  const qualifier = nodes.find((node) => node.id === "qualifier") as Node;
  const claim = nodes.find((node) => node.id === "claim") as Node;

  const warrantBacking = nodes.find(
    (node) => node.id === "warrantBacking"
  ) as Node;

  updatedNodes.push({
    ...warrantBacking,
    position: {
      x: groundsBackingWidth + groundsWidth + spacing * 2,
      y: 0,
    },
  });

  const warrant = nodes.find((node) => node.id === "warrant") as Node;

  updatedNodes.push({
    ...warrant,
    position: {
      x: groundsBackingWidth + groundsWidth + spacing * 2,
      y: warrantBackingHeight + spacing,
    },
  });

  const rebuttal = nodes.find((node) => node.id === "rebuttal") as Node;
  updatedNodes.push({
    ...rebuttal,
    position: {
      x: (width + spacing) * 4,
      y:
        Math.max(
          groundsBacking.measured?.height ?? 0,
          grounds.measured?.height ?? 0,
          qualifier.measured?.height ?? 0,
          claim.measured?.height ?? 0
        ) +
        warrantBackingHeight +
        warrantHeight +
        spacing * 3,
    },
  });

  argumentLayout.main.forEach((nodeId, index) => {
    const node = nodes.find((node) => node.id === nodeId);
    if (node) {
      let height = 0;
      let x = index * (width + spacing);

      if (node.type === "midpoint") {
        x = x + spacing;
        height =
          Math.max(
            groundsBacking.measured?.height ?? 0,
            grounds.measured?.height ?? 0,
            qualifier.measured?.height ?? 0,
            claim.measured?.height ?? 0
          ) / 2;
      }

      updatedNodes.push({
        ...node,
        position: {
          x: x,
          y: height + warrantBackingHeight + warrantHeight + spacing * 2,
        },
      });
    }
  });

  return updatedNodes;
};

export default function useLayout() {
  const { getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized(options);
  const [nodes, setNodes] = useState(getNodes());

  useEffect(() => {
    if (nodesInitialized) {
      setNodes(updateNodesPositions(getNodes()));
    }
  }, [nodesInitialized, getNodes]);

  return nodes;
}
