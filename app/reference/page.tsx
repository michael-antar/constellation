import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/types";
import ReferenceClient from "./reference-client";
import { promises as fs } from "fs";
import path from "path";

export default async function ReferencePage() {
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    redirect("/");
  }

  const filePath = path.join(
    process.cwd(),
    "app/reference/example-content.mdx"
  );
  const initialContent = await fs.readFile(filePath, "utf8");

  return <ReferenceClient initialContent={initialContent} />;
}
