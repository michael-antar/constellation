"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Node,
  Edge,
  useNodesInitialized,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import * as d3 from "d3-force";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  SimulationNodeDatum,
} from "d3-force";
import "@xyflow/react/dist/style.css";
import CustomNode from "./custom-node";
import { GraphSearch } from "./graph-search";
import { GraphFilter } from "./graph-filter";
import { GraphNode, GraphEdge } from "@/types/types";

const nodeTypes = {
  custom: CustomNode,
};

type SimulationNode = SimulationNodeDatum & Node;

type GraphClientProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  enableSearch?: boolean;
  className?: string;
};

export function GraphClientInternal({
  nodes: propNodes,
  edges: propEdges,
  enableSearch = true,
  className,
}: GraphClientProps) {
  const router = useRouter();
  const nodesInitialized = useNodesInitialized(); // Check if nodes are ready

  const { fitView } = useReactFlow();

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Keep track of the simulation instance
  const simulationRef = React.useRef<d3.Simulation<
    SimulationNode,
    undefined
  > | null>(null);

  // --- Category Filters ---
  // Derive unique categories from props
  const uniqueCategories = React.useMemo(() => {
    const map = new Map<string, string>();
    propNodes.forEach((node) => {
      const catName = node.category || "Uncategorized";
      const catColor = node.color || "#9ca3af";
      if (!map.has(catName)) {
        map.set(catName, catColor);
      }
    });
    return Array.from(map.entries()).map(([name, color]) => ({ name, color }));
  }, [propNodes]);

  // State for active filters (Default to all selected)
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );

  // Initialize selectedCategories once uniqueCategories is calculated
  React.useEffect(() => {
    if (uniqueCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(uniqueCategories.map((c) => c.name));
    }
  }, [uniqueCategories, selectedCategories.length]);

  const toggleCategory = (catName: string) => {
    setSelectedCategories(
      (prev) =>
        prev.includes(catName)
          ? prev.filter((c) => c !== catName) // Remove
          : [...prev, catName] // Add
    );
  };

  // - Filter Nodes and Edges logic -
  const filteredNodes = React.useMemo(() => {
    return propNodes.filter((n) => {
      const cat = n.category || "Uncategorized";
      return selectedCategories.includes(cat);
    });
  }, [propNodes, selectedCategories]);

  const filteredEdges = React.useMemo(() => {
    // Only keep edges where BOTH source and target are visible
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    return propEdges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );
  }, [propEdges, filteredNodes]);

  // --- Initial Data Setup ---
  React.useEffect(() => {
    const initialNodes: Node[] = filteredNodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: {
        x: (Math.random() - 0.5) * 500, // Random spread between -250 and 250
        y: (Math.random() - 0.5) * 500,
      },
      data: {
        label: node.label,
        slug: node.slug,
        color: node.color,
        incomingLinkCount: node.incomingLinkCount,
        isDimmed: false,
      },
    }));

    const initialEdges: Edge[] = filteredEdges.map((edge) => ({
      ...edge,
      animated: true,
      style: { stroke: "#888", cursor: "grab" },
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [filteredNodes, filteredEdges, setNodes, setEdges]);

  // Physics Engine
  React.useEffect(() => {
    // Only run the simulation if nodes exist and React Flow has initialized them
    if (!nodesInitialized || filteredNodes.length === 0) return;

    // Simplified nodes/links for D3 to calculate
    const d3Nodes = nodes.map((node) => ({
      ...node,
      x: node.position.x,
      y: node.position.y,
    })) as (d3.SimulationNodeDatum & Node)[];

    const d3Links = edges.map((edge) => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    }));

    // Initialize simulation
    const simulation = forceSimulation(d3Nodes)
      // Force 1: Links pull nodes together
      .force(
        "link",
        forceLink(d3Links)
          .id((d) => (d as SimulationNode).id)
          .distance(150) // Desired length of lines
      )
      // Force 2: Nodes push each other away
      .force("charge", forceManyBody().strength(-100))
      // Force 3: Pull everything towards center
      .force("center", forceCenter(0, 0))
      // Force 4: Prevent node overlap
      .force("collide", d3.forceCollide().radius(20)) // Approximate node radius
      .stop();

    // Warm up graph before paint
    const numTicks = 300;
    for (let i = 0; i < numTicks; ++i) {
      simulation.tick();
    }

    // Update nodes with settled positions
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const d3Node = d3Nodes.find((n) => n.id === node.id);
        if (!d3Node) return node;

        return {
          ...node,
          position: { x: d3Node.x!, y: d3Node.y! },
        };
      })
    );

    // Zoom view to fit
    window.requestAnimationFrame(() => {
      fitView({ padding: 0.1 });
    });

    // Attach tick listener to update node positions
    simulation.on("tick", () => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          const d3Node = d3Nodes.find((n) => n.id === node.id);
          if (!d3Node) return node;

          return {
            ...node,
            position: { x: d3Node.x!, y: d3Node.y! },
          };
        })
      );
    });

    simulationRef.current = simulation;

    // Stop simulation when component unmounts
    return () => {
      simulation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized, edges.length, setNodes]); // Re-run if edges change);

  // --- Interation Handlers ---

  // Redirect to node's page
  const onNodeClick = React.useCallback(
    (event: React.MouseEvent, node: Node) => {
      router.push(`/pages/${node.data.slug}`);
    },
    [router]
  );

  // Wake up simulation if "cold"
  const onNodeDragStart = React.useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
    }
  }, []);

  // Tell D3 that dragged node is fixed at mouse position
  const onNodeDrag = React.useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (simulationRef.current) {
        const d3Node = simulationRef.current
          .nodes()
          .find((n) => n.id === node.id);
        if (d3Node) {
          d3Node.fx = node.position.x;
          d3Node.fy = node.position.y;
        }
      }
    },
    []
  );

  // Let dragged node float freely again + cool down sim
  const onNodeDragStop = React.useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (simulationRef.current) {
        const d3Node = simulationRef.current
          .nodes()
          .find((n) => n.id === node.id);
        if (d3Node) {
          d3Node.fx = null;
          d3Node.fy = null;
        }
        // Cool down sim
        simulationRef.current.alphaTarget(0);
      }
    },
    []
  );

  // Highlight selected node
  const onNodeMouseEnter = React.useCallback(
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

  // Reset highlights
  const onNodeMouseLeave = React.useCallback(() => {
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
      onNodeDragStart={onNodeDragStart}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      className={`text-slate-600 ${className || ""}`}
    >
      <Controls showInteractive={false} />
      <Background />

      {enableSearch && (
        <Panel position="top-right" className="flex gap-2 items-start">
          <GraphFilter
            categories={uniqueCategories}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
          />
          <GraphSearch nodes={nodes} />
        </Panel>
      )}
    </ReactFlow>
  );
}

// Wrap with ReactFlowProvider
export function GraphClient(props: GraphClientProps) {
  return (
    <ReactFlowProvider>
      <GraphClientInternal {...props} />
    </ReactFlowProvider>
  );
}
