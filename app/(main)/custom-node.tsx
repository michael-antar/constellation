"use client";

import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

function CustomNode({
  data,
}: {
  data: { label: string; color: string | null };
}) {
  const nodeColor = data.color || "#9ca3af"; // Default to gray if no color

  return (
    <div
      className="px-4 py-2 shadow-md rounded-md bg-background border-2"
      // Use the category color for the border
      style={{ borderColor: nodeColor }}
    >
      {/* The "handle" - the dot where edges connect to */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-transparent"
      />

      {/* The node's content */}
      <div
        className="font-bold"
        // Use the category color for the text
        style={{ color: nodeColor }}
      >
        {data.label}
      </div>

      {/* This handle is where edges connect from */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-transparent"
      />
    </div>
  );
}

// 'memo' prevents re-rendering a node if its data hasn't changed
export default memo(CustomNode);
