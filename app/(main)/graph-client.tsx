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
          incomingLinkCount: node.incomingLinkCount,
          isDimmed: false,
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

  const onNodeMouseEnter = useCallback(
    // Highlight node logic
    (_: React.MouseEvent, node: Node) => {
      // Find all edges connected to hovered node
      const connectedEdges = edges.filter(
        (e) => e.source === node.id || e.target === node.id
      );
      const connectedEdgeIds = new Set(connectedEdges.map((e) => e.id));

      // Find all nodes that are connected
      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(node.id); // Add the hovered node itself
      connectedEdges.forEach((e) => {
        connectedNodeIds.add(e.source);
        connectedNodeIds.add(e.target);
      });

      // Update Nodes: Dim if not in the connected set
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isDimmed: !connectedNodeIds.has(n.id),
          },
        }))
      );

      // Update Edges: Dim if not in the connected edge set
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          style: {
            opacity: connectedEdgeIds.has(e.id) ? 1 : 0.1,
            stroke: connectedEdgeIds.has(e.id) ? "#888" : "#e5e7eb",
          },
        }))
      );
    },
    [edges, setNodes, setEdges]
  );

  const onNodeMouseLeave = useCallback(() => {
    // Reset everything to visible
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isDimmed: false },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { ...e.style, opacity: 1, stroke: "#888" },
      }))
    );
  }, [setNodes, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      nodeTypes={nodeTypes}
      fitView // Zoom to fit all nodes on load
      className="text-slate-600"
    >
      <Controls showInteractive={false} />
      <Background />
    </ReactFlow>
  );
}
