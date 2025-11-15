"use client";

import { Handle, Position, useViewport } from "@xyflow/react";
import { memo, useState } from "react";

function CustomNode({
  data,
}: {
  data: { label: string; color: string | null; incomingLinkCount: number };
}) {
  const nodeColor = data.color || "#9ca3af"; // Default to gray if no color

  const { zoom } = useViewport(); // Get current zoom level

  const [isHovered, setIsHovered] = useState(false);

  // Calculate dynamic size based on incoming links
  const baseSize = 15;
  const linkBonus = data.incomingLinkCount * 4;
  const size = baseSize + linkBonus;

  const isLabelVisible = zoom > 0.8 || isHovered; // Decide if label should be visible

  return (
    // Circular Node
    <div
      title={data.label}
      className="relative rounded-full flex items-center justify-center shadow-md border border-gray-400"
      style={{
        backgroundColor: nodeColor,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title */}
      {isLabelVisible && (
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
      )}

      <Handle type="target" position={Position.Left} className="invisible" />
      <Handle type="source" position={Position.Right} className="invisible" />
    </div>
  );
}

export default memo(CustomNode); // Prevent re-rendering a node if its data hasn't changed
