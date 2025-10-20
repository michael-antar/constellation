import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";
import { updatePageSchema } from "@/lib/zod";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get user session and authorize role (only admins can directly edit pages)
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const resolvedParams = await context.params;
  const pageId = resolvedParams.id;

  try {
    const body = await request.json();
    const parsedData = updatePageSchema.parse(body); // Validate the incoming data
    const { title, content, description, categoryId } = parsedData;

    const sql = neon(process.env.DATABASE_URL!);

    // Update the page in the database
    await sql`
      UPDATE pages
      SET 
        title = ${title}, 
        content = ${content}, 
        description = ${description}, 
        category_id = ${categoryId},
        updated_at = NOW()
      WHERE id = ${pageId}
    `;

    return NextResponse.json(
      { message: "Page updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    // If validation fails, Zod throws an error
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message);
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    console.error("Failed to update page:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
