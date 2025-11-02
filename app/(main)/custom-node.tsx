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
    // Circular Node
    <div
      className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-md border border-gray-400"
      style={{ backgroundColor: nodeColor }}
    >
      {/* Title */}
      <div
        className="absolute text-center font-semibold px-2 py-0.5 rounded-sm whitespace-nowrap"
        style={{
          color: nodeColor,
          backgroundColor: nodeColor + "20",
          bottom: "100%", // Positioned above the 100% height of the circle
          left: "50%",
          transform: "translateX(-50%)", // Horizontally centers the text
          marginBottom: "4px", // Small gap between circle
        }}
      >
        {data.label}
      </div>

      <Handle type="target" position={Position.Left} className="invisible" />
      <Handle type="source" position={Position.Right} className="invisible" />
    </div>
  );
}

export default memo(CustomNode); // Prevent re-rendering a node if its data hasn't changed
