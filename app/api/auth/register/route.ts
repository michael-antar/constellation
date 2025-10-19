import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import { ZodError } from "zod";
import { registerSchema } from "@/lib/zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body using Zod
    const { email, password, name } = registerSchema.parse(body);

    // Connect to database
    const sql = neon(process.env.DATABASE_URL!);

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Insert the new user
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

    return NextResponse.json(
      { message: "User created successfully." },
      { status: 201 }
    );
  } catch (error) {
    // If validation fails, Zod throws an error
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message);
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
