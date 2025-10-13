import { auth } from "@/auth";
import { AuthButton } from "./auth-button";
import { Sparkle } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b">
      <nav className="flex items-center justify-between p-4">
        <div className="flex gap-2 font-bold">
          <Sparkle />
          Constellation
        </div>
        <AuthButton session={session} />
      </nav>
    </header>
  );
}
