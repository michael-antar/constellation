import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { AuthButton } from "./auth-button";
import { Sparkle } from "lucide-react";
import { UserRole } from "@/types/types";

export async function Header() {
  const session = await auth();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  return (
    <header className="border-b">
      <nav className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Sparkle />
          Constellation
        </Link>
        <div className="flex gap-4">
          {isAdmin && (
            <Button asChild>
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          )}
          <ModeToggle />
          <AuthButton session={session} />
        </div>
      </nav>
    </header>
  );
}
