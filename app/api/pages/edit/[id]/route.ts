import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless"; // Import Pool
import { ZodError } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";
import { updatePageSchema } from "@/lib/zod";

// Create the pool once, outside the handler
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get user session and authorize role
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const resolvedParams = await context.params;
  const source_page_id = resolvedParams.id;

  // Get a client from the pool
  const client = await pool.connect();

  try {
    const body = await request.json();
    const parsedData = updatePageSchema.parse(body); // Validate
    const { title, content, description, categoryId } = parsedData;

    // --- START TRANSACTION ---
    await client.query("BEGIN");

    // Update the page itself
    await client.query(
      `UPDATE pages
       SET 
         title = $1, 
         content = $2, 
         description = $3, 
         category_id = $4,
         updated_at = NOW()
       WHERE id = $5`,
      [title, content, description, categoryId, source_page_id]
    );

    // Delete all old links from this page
    await client.query(`DELETE FROM links WHERE source_page_id = $1`, [
      source_page_id,
    ]);

    // Find and re-create all links from the new content
    const pageContent = content || "";
    const linkRegex = /\[[^\]]+\]\(\/pages\/([a-z0-9-]+)\)/g;
    const matches = [...pageContent.matchAll(linkRegex)];
    const slugs = matches.map((match) => match[1]);
    const uniqueSlugs = [...new Set(slugs)];

    if (uniqueSlugs.length > 0) {
      // Get the IDs of the pages we're linking to
      const targetPagesResult = await client.query(
        `SELECT id FROM pages WHERE slug = ANY($1::text[])`,
        [uniqueSlugs]
      );

      const targetIds = targetPagesResult.rows.map((page) => page.id);

      if (targetIds.length > 0) {
        // Bulk insert all new links
        const sourceIds = targetIds.map(() => source_page_id);

        await client.query(
          `INSERT INTO links (source_page_id, target_page_id)
           SELECT * FROM unnest($1::uuid[], $2::uuid[])`,
          [sourceIds, targetIds]
        );
      }
    }

    // --- COMMIT TRANSACTION ---
    await client.query("COMMIT");

    return NextResponse.json(
      { message: "Page updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    // --- ROLLBACK TRANSACTION ---
    await client.query("ROLLBACK");

    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message);
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    console.error("Failed to update page:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  } finally {
    // --- RELEASE CLIENT ---
    // Always release the client back to the pool
    client.release();
  }
}
