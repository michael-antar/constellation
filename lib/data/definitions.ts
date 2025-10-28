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

// Fetches a single definition by its ID
export async function getDefinitionById(
  id: string
): Promise<Definition | null> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const definitions = (await sql`
      SELECT * FROM definitions
      WHERE id = ${id}
    `) as Definition[];

    // Check if any definition was returned
    if (definitions.length === 0) {
      return null; // No definition found with that ID
    }

    // Return the first (and only) item from the array
    return definitions[0];
  } catch (error) {
    console.error("Failed to fetch definition by ID:", error);
    return null; // Return null in case of a database error
  }
}
