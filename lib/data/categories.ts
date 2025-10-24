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
