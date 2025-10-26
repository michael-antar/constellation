import { neon } from "@neondatabase/serverless";
import { Definition } from "@/types/types";

// Server-side functions for definitions

// Get all definitions, sorted alphabetically by term
export async function getDefinitions(): Promise<Definition[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Query for all definitions, ordering them alphabetically by term
    const definitions = (await sql`
      SELECT * FROM definitions ORDER BY term ASC
    `) as Definition[];

    return definitions;
  } catch (error) {
    console.error("Failed to fetch definitions:", error);
    return []; // Return an empty array on error
  }
}
