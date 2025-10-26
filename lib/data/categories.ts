import { neon } from "@neondatabase/serverless";
import { Category } from "@/types/types";

// Server-side functions for categories

export async function getCategories(): Promise<Category[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const categories = (await sql`
      SELECT id, name, color_hex FROM categories ORDER BY name ASC
    `) as Category[];

    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return []; // Return an empty array on error
  }
}

// Fetches a single category by its ID
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const categories = (await sql`
      SELECT id, name, color_hex FROM categories
      WHERE id = ${id}
    `) as Category[];

    // Check if any category was returned
    if (categories.length === 0) {
      return null; // No category found with that ID
    }

    // Return the first (and only) item from the array
    return categories[0];
  } catch (error) {
    console.error("Failed to fetch category by ID:", error);
    return null; // Return null in case of a database error
  }
}
