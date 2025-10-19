import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";
import { createCategorySchema } from "@/lib/zod";
import { ZodError } from "zod";

export async function POST(request: Request) {
  // Authorize user role (only admins can create categories)
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsedData = createCategorySchema.parse(body);
    const { name, color_hex } = parsedData;

    const sql = neon(process.env.DATABASE_URL!);

    // Perform a case-insensitive check for an existing category
    const existingCategory = await sql`
      SELECT id FROM categories WHERE LOWER(name) = LOWER(${name})
    `;

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { message: "A category with this name already exists." },
        { status: 409 }
      );
    }

    // Insert the new category into the database
    const [newCategory] = await sql`
      INSERT INTO categories (name, color_hex)
      VALUES (${name}, ${color_hex})
      RETURNING *
    `;

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    // If validation fails, Zod throws an error
    if (error instanceof ZodError) {
      const errorMessage = error.issues[0]?.message || "Invalid input.";
      return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    console.error("Failed to create category:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
