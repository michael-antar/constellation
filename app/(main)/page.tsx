import { getGraphData } from "@/lib/data/graph";
import { GraphClient } from "@/components/graph/graph-client";

export default async function HomePage() {
  // Fetch the graph data on the server
  const { nodes, edges } = await getGraphData();

  return (
    <div className="container mx-auto py-12">
      {/* SEO-friendly 'about' section */}
      <section className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold">Welcome to Constellation</h1>
        <p className="text-lg text-muted-foreground mt-4">
          An interactive knowledge map of computer science concepts. Explore the
          connections between data structures, algorithms, and fundamental
          principles.
        </p>
      </section>

      {/* Constellation Graph (Client Component)*/}
      <section className="h-[70vh] border rounded-lg bg-background">
        <GraphClient nodes={nodes} edges={edges} />
      </section>
    </div>
  );
}
