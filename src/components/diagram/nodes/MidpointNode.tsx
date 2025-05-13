"use client";

import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

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

export default MidpointNode; 