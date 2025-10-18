import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Query for all categories, ordering them alphabetically by name
    const categories = await sql`
      SELECT id, name, color_hex FROM categories ORDER BY name ASC
    `;

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
