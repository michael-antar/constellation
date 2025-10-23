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
    console.error("Failed to fetch pages:", error);
    // TODO: Throw error to catch when called?
    return [];
  }
}
