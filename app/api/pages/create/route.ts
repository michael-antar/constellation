import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { createPageSchema } from "@/lib/zod";
import { ZodError } from "zod";
import { UserRole } from "@/types/types";

// Create the pool once, outside the handler
// The pool will manage connections efficiently for your serverless function
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export async function POST(request: Request) {
  // Get user session and authorize role
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const authorId = session.user.id;

  // Get a client from the pool for our transaction
  const client = await pool.connect();

  try {
    const body = await request.json();
    const parsedData = createPageSchema.parse(body); // Validate
    const { title, slug, content, description, categoryId } = parsedData;

    // --- START TRANSACTION ---
    await client.query("BEGIN");

    // Check if the slug is already in use
    const existingPage = await client.query(
      `SELECT id FROM pages WHERE slug = $1`,
      [slug]
    );

    if (existingPage.rows.length > 0) {
      // This error will be caught, triggering a ROLLBACK
      throw new Error("This slug is already in use.");
    }

    // Insert the new page
    const newPageResult = await client.query(
      `INSERT INTO pages (title, slug, content, description, category_id, author_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [title, slug, content, description, categoryId, authorId]
    );
    const newPage = newPageResult.rows[0];
    const source_page_id = newPage.id;

    // Find and insert links
    const pageContent = content || "";
    const linkRegex = /\[[^\]]+\]\(\/pages\/([a-z0-9-]+)\)/g;
    const matches = [...pageContent.matchAll(linkRegex)];
    const slugs = matches.map((match) => match[1]);
    const uniqueSlugs = [...new Set(slugs)];

    if (uniqueSlugs.length > 0) {
      // Get the IDs of the pages we're linking to
      const targetPagesResult = await client.query(
        `SELECT id FROM pages WHERE slug = ANY($1::text[])`, // Use $1
        [uniqueSlugs]
      );

      const targetIds = targetPagesResult.rows.map((page) => page.id);

      if (targetIds.length > 0) {
        // Create an array of source_page_id that matches the length of targetIds
        const sourceIds = targetIds.map(() => source_page_id);

        // Use unnest to bulk insert pairs
        await client.query(
          `INSERT INTO links (source_page_id, target_page_id)
           SELECT * FROM unnest($1::uuid[], $2::uuid[])`,
          [sourceIds, targetIds]
        );
      }
    }

    // --- COMMIT TRANSACTION ---
    await client.query("COMMIT");

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    // --- ROLLBACK TRANSACTION ---
    // If any error occurred, roll back all changes
    await client.query("ROLLBACK");

    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message);
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    if (
      error instanceof Error &&
      error.message === "This slug is already in use."
    ) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error("Page creation error:", error);
    return NextResponse.json(
      { message: "An internal error occurred" },
      { status: 500 }
    );
  } finally {
    // --- RELEASE CLIENT ---
    // Always release the client back to the pool
    client.release();
  }
}
