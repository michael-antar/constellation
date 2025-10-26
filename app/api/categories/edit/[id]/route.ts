import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";
import { updateCategorySchema } from "@/lib/zod";
import { ZodError } from "zod";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Authorize user role (only admins can edit)
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Get ID (from URL params) and Body
    const resolvedParams = await context.params;
    const categoryId = resolvedParams.id;
    const body = await request.json();

    // Validate body
    const parsedData = updateCategorySchema.parse(body);
    const { name, color_hex } = parsedData;

    const sql = neon(process.env.DATABASE_URL!);

    // Check if the new name is already used by another category
    const existingCategory = await sql`
      SELECT id FROM categories 
      WHERE LOWER(name) = LOWER(${name}) AND id != ${categoryId}
    `;

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { message: "A category with this name already exists." },
        { status: 409 } // 409 Conflict
      );
    }

    // Update the category in the database
    await sql`
      UPDATE categories
      SET 
        name = ${name}, 
        color_hex = ${color_hex}
      WHERE id = ${categoryId}
    `;

    return NextResponse.json(
      { message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message);
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    // Handle potential database unique constraint errors (just in case)
    if (error && typeof error === "object" && "code" in error) {
      const dbError = error as { code: string };

      // unique_violation
      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            message: "A category with this name already exists.",
          },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // Generic error
    console.error("Failed to update category:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
