import { neon } from "@neondatabase/serverless";
import { GraphNode, GraphEdge } from "@/types/types";

type PageData = {
  id: string;
  title: string;
  slug: string;
  color_hex: string | null;
};

type LinkData = {
  source_page_id: string;
  target_page_id: string;
};

// Fetches all pages and links from the database and formats them as nodes and edges for a graph.
export async function getGraphData(): Promise<{
  nodes: GraphNode[];
  edges: GraphEdge[];
}> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Fetch pages (nodes) and links (edges) in parallel
    const [pagesResult, linksResult] = await Promise.all([
      // Use LEFT JOIN in case a page has no category
      sql`
        SELECT 
          p.id, 
          p.title, 
          p.slug, 
          c.color_hex 
        FROM 
          pages p
        LEFT JOIN 
          categories c ON p.category_id = c.id
      `,
      sql`SELECT source_page_id, target_page_id FROM links`,
    ]);

    const pages = pagesResult as PageData[];
    const links = linksResult as LinkData[];

    // Store incoming links count for each page
    const linkCounts = new Map<string, number>();
    for (const link of links) {
      const count = linkCounts.get(link.target_page_id) || 0;
      linkCounts.set(link.target_page_id, count + 1);
    }

    // Format the pages as GraphNodes
    const nodes: GraphNode[] = pages.map((page) => ({
      id: page.id,
      label: page.title,
      slug: page.slug,
      color: page.color_hex,
      incomingLinkCount: linkCounts.get(page.id) || 0,
    }));

    // Format the links as GraphEdges
    const edges: GraphEdge[] = links.map((link) => ({
      id: `${link.source_page_id}-${link.target_page_id}`,
      source: link.source_page_id,
      target: link.target_page_id,
    }));

    return { nodes, edges };
  } catch (error) {
    console.error("Failed to fetch graph data:", error);
    return { nodes: [], edges: [] };
  }
}
