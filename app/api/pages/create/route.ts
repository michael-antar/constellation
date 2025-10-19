import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { createPageSchema } from "@/lib/zod";
import { ZodError } from "zod";
import { UserRole } from "@/types/types";

export async function POST(request: Request) {
  // Get user session and authorize role (only admins can create pages)
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const authorId = session.user.id;

  try {
    const body = await request.json();

    // Validate the incoming data
    const parsedData = createPageSchema.parse(body);
    const { title, slug, content, description, categoryId } = parsedData;

    const sql = neon(process.env.DATABASE_URL!);

    // Check if the slug is already in use
    const existingPage = await sql`SELECT id FROM pages WHERE slug = ${slug}`;
    if (existingPage.length > 0) {
      return NextResponse.json(
        { message: "This slug is already in use." },
        { status: 409 }
      );
    }

    // Insert the new page into the database
    const [newPage] = await sql`
      INSERT INTO pages (title, slug, content, description, category_id, author_id)
      VALUES (${title}, ${slug}, ${content}, ${description}, ${categoryId}, ${authorId})
      RETURNING slug
    `;

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    // If validation fails, Zod throws an error
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message);
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    console.error("Page creation error:", error);
    return NextResponse.json(
      { message: "An internal error occurred" },
      { status: 500 }
    );
  }
}
