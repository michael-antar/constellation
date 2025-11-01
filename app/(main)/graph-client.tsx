"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./custom-node";
import { GraphNode, GraphEdge } from "@/types/types";

const nodeTypes = {
  custom: CustomNode,
};

type GraphClientProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export function GraphClient({
  nodes: propNodes,
  edges: propEdges,
}: GraphClientProps) {
  const router = useRouter();

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // This effect runs once to format data for React Flow
  useEffect(() => {
    const radius = 300 * Math.ceil(Math.sqrt(propNodes.length)); // Calculate radius for circle
    const angleStep = (2 * Math.PI) / propNodes.length;

    const initialNodes: Node[] = propNodes.map((node, i) => {
      // Calculate a simple circular layout
      const x = radius * Math.cos(angleStep * i);
      const y = radius * Math.sin(angleStep * i);

      return {
        id: node.id,
        type: "custom", // Use custom node
        position: { x, y },
        data: {
          label: node.label,
          slug: node.slug,
          color: node.color,
        },
      };
    });

    const initialEdges: Edge[] = propEdges.map((edge) => ({
      ...edge,
      animated: true, // Make the edges animated
      style: { stroke: "#888" },
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [propNodes, propEdges, setNodes, setEdges]);

  // Handle clicking on a node
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      router.push(`/pages/${node.data.slug}`);
    },
    [router]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView // Zoom to fit all nodes on load
      className="bg-background"
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
}
