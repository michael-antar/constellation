import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";
import { updateDefinitionSchema } from "@/lib/zod";
import { ZodError } from "zod";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Authorize user role (only admins can edit definitions)
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Get ID and Body
    const resolvedParams = await context.params;
    const definitionId = resolvedParams.id;
    const body = await request.json();

    // Validate body
    const parsedData = updateDefinitionSchema.parse(body);
    const { term, explanation } = parsedData;

    const sql = neon(process.env.DATABASE_URL!);

    // Check if the new term is already used by another definition
    const existingDefinition = await sql`
      SELECT id FROM definitions 
      WHERE LOWER(term) = LOWER(${term}) AND id != ${definitionId}
    `;

    if (existingDefinition.length > 0) {
      return NextResponse.json(
        { message: "A definition with this term already exists." },
        { status: 409 } // 409 Conflict
      );
    }

    // Update the definition
    await sql`
      UPDATE definitions
      SET 
        term = ${term}, 
        explanation = ${explanation}
      WHERE id = ${definitionId}
    `;

    return NextResponse.json(
      { message: "Definition updated successfully" },
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
            message: "A definition with this name already exists.",
          },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // General error
    console.error("Failed to update definition:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
