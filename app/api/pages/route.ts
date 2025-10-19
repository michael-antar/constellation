import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Query for all pages, ordering them alphabetically by title
    const pages = await sql`
      SELECT * FROM pages ORDER BY title ASC
    `;

    return NextResponse.json(pages, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
