import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Authorize user role (only admins can delete)
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Get the category ID from the URL parameters
    const resolvedParams = await context.params;
    const categoryId = resolvedParams.id;

    if (!categoryId) {
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Attempt to delete the category
    const result = await sql`
      DELETE FROM categories
      WHERE id = ${categoryId}
      RETURNING id
    `;

    // Check if a category was actually found and deleted
    if (result.length === 0) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Success
    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      const dbError = error as { code: string };

      // SQLSTATE '23503' is for foreign_key_violation (ON DELETE RESTRICT)
      if (dbError.code === "23503") {
        return NextResponse.json(
          {
            message:
              "Cannot delete category. It is still being used by one or more pages.",
          },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // Handle generic errors
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
