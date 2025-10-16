import { auth } from "@/auth";
import Link from "next/link";
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
        <AuthButton session={session} />
      </nav>
    </header>
  );
}
