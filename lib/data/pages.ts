import { neon } from "@neondatabase/serverless";
import { Page } from "@/types/types";

// Server-side function to get all pages
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
