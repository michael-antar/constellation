import { neon } from "@neondatabase/serverless";
import { Page } from "@/types/types";

// This is a server-side function, NOT an API route or Server Action.
// It can be imported and used directly by Server Components.
export async function getPages(): Promise<Page[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const pages = (await sql`
      SELECT * FROM pages ORDER BY title ASC
    `) as Page[];

    return pages;
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    // In a real app, you might want to throw the error
    // to be caught by an error boundary.
    return [];
  }
}
