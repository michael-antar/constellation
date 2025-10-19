import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/types";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect non-admins to the homepage
  const session = await auth();
  if (session?.user?.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
