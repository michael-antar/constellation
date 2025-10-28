import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { UserRole } from "@/types/types";
import { createDefinitionSchema } from "@/lib/zod";
import { ZodError } from "zod";

export async function POST(request: Request) {
  // Authorize user (only admins can create definitions)
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate data
    const parsedData = createDefinitionSchema.parse(body);
    const { term, explanation } = parsedData;

    const sql = neon(process.env.DATABASE_URL!);

    // Check for uniqueness (case-insensitive)
    const existingDefinition = await sql`
      SELECT id FROM definitions WHERE LOWER(term) = LOWER(${term})
    `;

    if (existingDefinition.length > 0) {
      return NextResponse.json(
        { message: "A definition with this term already exists." },
        { status: 409 } // 409 Conflict
      );
    }

    // Insert the new definition
    const [newDefinition] = await sql`
      INSERT INTO definitions (term, explanation)
      VALUES (${term}, ${explanation})
      RETURNING *
    `;

    return NextResponse.json(newDefinition, { status: 201 });
  } catch (error) {
    // If validation fails, Zod throws an error
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
            message: "A defintion with this term already exists.",
          },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // Generic error
    console.error("Failed to create definition:", error);
    return NextResponse.json(
      { message: "An internal error occurred." },
      { status: 500 }
    );
  }
}
