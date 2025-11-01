import { neon } from "@neondatabase/serverless";
import { Page, PageLink } from "@/types/types";

// Server-side functions for pages

// Get all pages
export async function getPages(): Promise<Page[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const pages = (await sql`
      SELECT * FROM pages ORDER BY title ASC
    `) as Page[];

    return pages;
  } catch (error) {
    // TODO: Throw error to catch when called?
    console.error("Failed to fetch pages:", error);
    return [];
  }
}

// Fetches a single page by its ID.
export async function getPageById(id: string): Promise<Page | null> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const pages = (await sql`
      SELECT * FROM pages
      WHERE id = ${id}
    `) as Page[];

    if (pages.length === 0) {
      return null; // No page found with that ID
    }

    // Return the first (and only) item from the array
    return pages[0];
  } catch (error) {
    console.error("Failed to fetch page by ID:", error);
    return null; // Return null in case of a database error
  }
}

// Fetch a single page by its slug
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const pages = (await sql`
      SELECT * FROM pages
      WHERE slug = ${slug}
    `) as Page[];

    if (pages.length === 0) {
      return null; // No page found with that slug
    }

    return pages[0];
  } catch (error) {
    console.error("Failed to fetch page by slug:", error);
    return null; // Return null in case of a database error
  }
}

// Fetches all pages that the given page links to
export async function getOutgoingLinks(pageId: string): Promise<PageLink[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get target page details
    const links = (await sql`
      SELECT 
        p.title, 
        p.slug
      FROM 
        links l
      JOIN 
        pages p ON l.target_page_id = p.id
      WHERE 
        l.source_page_id = ${pageId}
      ORDER BY
        p.title ASC
    `) as PageLink[];

    return links;
  } catch (error) {
    console.error("Failed to fetch outgoing links:", error);
    return []; // Return an empty array on error
  }
}

// Fetches all pages that link to the given page
export async function getIncomingLinks(pageId: string): Promise<PageLink[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get source page details
    const links = (await sql`
      SELECT 
        p.title, 
        p.slug
      FROM 
        links l
      JOIN 
        pages p ON l.source_page_id = p.id
      WHERE 
        l.target_page_id = ${pageId}
      ORDER BY
        p.title ASC
    `) as PageLink[];

    return links;
  } catch (error) {
    console.error("Failed to fetch incoming links:", error);
    return []; // Return an empty array on error
  }
}
