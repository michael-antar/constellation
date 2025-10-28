import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Authorize user role (only admins can delete defintions )
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Get the ID from the URL
    const resolvedParams = await context.params;
    const definitionId = resolvedParams.id;

    if (!definitionId) {
      return NextResponse.json(
        { message: "Definition ID is required" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Attempt to delete the definition
    const result = await sql`
      DELETE FROM definitions
      WHERE id = ${definitionId}
      RETURNING id
    `;

    // Check if a definition was actually found and deleted
    if (result.length === 0) {
      return NextResponse.json(
        { message: "Definition not found" },
        { status: 404 }
      );
    }

    // Success
    return NextResponse.json(
      { message: "Definition deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Handle generic errors
    console.error("Failed to delete definition:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
