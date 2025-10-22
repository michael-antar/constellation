import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get user session and authorize role (only admins can delete pages)
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const resolvedParams = await context.params;
  const pageId = resolvedParams.id;

  if (!pageId) {
    return NextResponse.json(
      { message: "Page ID is required" },
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Delete the page from the database
    const result = await sql`
      DELETE FROM pages
      WHERE id = ${pageId}
      RETURNING id
    `;

    // Check if a page was actually deleted
    if (result.length === 0) {
      return NextResponse.json({ message: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Page deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete page:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
