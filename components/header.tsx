import { auth } from "@/auth";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { AuthButton } from "./auth-button";
import { Sparkle } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b">
      <nav className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Sparkle />
          Constellation
        </Link>
        <div className="flex gap-4">
          <ModeToggle />
          <AuthButton session={session} />
        </div>
      </nav>
    </header>
  );
}
