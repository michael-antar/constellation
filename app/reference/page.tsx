import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/types";
import ReferenceClient from "./reference-client";

export default async function ReferencePage() {
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return <ReferenceClient />;
}
