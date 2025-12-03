import { neon } from "@neondatabase/serverless";
import { GraphNode, GraphEdge } from "@/types/types";

type PageData = {
  id: string;
  title: string;
  slug: string;
  color_hex: string | null;
  category_title: string | null;
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
          c.color_hex,
          c.name as category_title
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
      category: page.category_title,
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

// Get the local "neighborhood" for a specific page
export async function getPageNeighborhood(slug: string): Promise<{
  nodes: GraphNode[];
  edges: GraphEdge[];
}> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get the center page
    const centerPageResult = await sql`
      SELECT id, title, slug, category_id FROM pages WHERE slug = ${slug}
    `;

    if (centerPageResult.length === 0) return { nodes: [], edges: [] };
    const centerPage = centerPageResult[0];

    // Get neighbors (incoming + outgoing) with their cateogry color
    const neighborsResult = await sql`
      WITH RECURSIVE 
      center AS (SELECT id FROM pages WHERE id = ${centerPage.id}),
      
      outgoing AS (
        SELECT
          p.id,
          p.title,
          p.slug,
          c.color_hex,
          c.name as category_title,
          'outgoing' as type
        FROM links l
        JOIN pages p ON l.target_page_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE l.source_page_id = (SELECT id FROM center)
      ),
      
      incoming AS (
        SELECT
          p.id,
          p.title,
          p.slug,
          c.color_hex,
          c.name as category_title,
          'incoming' as type
        FROM links l
        JOIN pages p ON l.source_page_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE l.target_page_id = (SELECT id FROM center)
      )

      SELECT * FROM outgoing
      UNION
      SELECT * FROM incoming
    `;

    // Get center page color
    const centerCategoryResult = await sql`
        SELECT color_hex, title FROM categories WHERE id = ${centerPage.category_id}
    `;
    const centerCategory = centerCategoryResult[0] || {
      color_hex: null,
      title: null,
    };

    // --- Construct nodes ---
    const nodes: GraphNode[] = [];

    // Add center node
    nodes.push({
      id: centerPage.id,
      label: centerPage.title,
      slug: centerPage.slug,
      color: centerCategory.color_hex,
      category: centerCategory.title,
      incomingLinkCount: neighborsResult.length + 5, // Make center node biggest
    });

    // Add neighbors
    // Use a map to ensure uniqueness (in case a page is both incoming and outgoing)
    const neighborMap = new Map();

    neighborsResult.forEach((n) => {
      if (!neighborMap.has(n.id)) {
        neighborMap.set(n.id, {
          id: n.id,
          label: n.title,
          slug: n.slug,
          color: n.color_hex,
          category: n.category_title,
          incomingLinkCount: 1, // Keep neighbors smaller
        });
      }
    });

    nodes.push(...(Array.from(neighborMap.values()) as GraphNode[]));

    // --- Construct Edges ---
    const edges: GraphEdge[] = [];

    neighborsResult.forEach((n) => {
      if (n.type === "outgoing") {
        edges.push({
          id: `${centerPage.id}-${n.id}`,
          source: centerPage.id,
          target: n.id,
        });
      } else {
        edges.push({
          id: `${n.id}-${centerPage.id}`,
          source: n.id,
          target: centerPage.id,
        });
      }
    });

    return { nodes, edges };
  } catch (error) {
    console.error("Failed to fetch neighborhood:", error);
    return { nodes: [], edges: [] };
  }
}
