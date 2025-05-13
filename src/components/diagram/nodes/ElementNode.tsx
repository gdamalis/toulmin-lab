"use client";

import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

interface ElementNodeProps {
  data: {
    label: string;
    title: string;
  };
}

const ElementNode = memo(({ data }: ElementNodeProps) => {
  return (
    <div className="node-content">
      {/* Handles for connecting nodes */}
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
});

ElementNode.displayName = "ElementNode";

export default ElementNode; 