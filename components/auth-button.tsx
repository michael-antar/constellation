"use client";

import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { User } from "lucide-react";

// Pass the session as a prop
type AuthButtonProps = {
  session: Session | null;
};

export function AuthButton({ session }: AuthButtonProps) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      let message = "An unknown error occurred.";
      switch (error) {
        case "OAuthAccountNotLinked":
          message = "This email is already linked with another provider.";
          break;
        case "CredentialsSignin":
          message =
            "Invalid credentials. Please check your email and password.";
          break;
        // Add more cases as needed
      }
      toast.error(message);
    }
  }, [error]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative h-8 w-8 rounded-full cursor-pointer"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={session?.user?.image ?? ""}
              alt={session?.user?.name ?? ""}
            />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        {session ? <SignedInContent session={session} /> : <SignedOutContent />}
      </PopoverContent>
    </Popover>
  );
}

function SignedInContent({ session }: { session: Session }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <p className="font-semibold">{session.user?.name}</p>
        <p className="text-sm text-muted-foreground">{session.user?.email}</p>
      </div>
      <Separator />
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}

function SignedOutContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Use the signIn function for credentials
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);
    if (result?.error) {
      toast.error("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold text-center">Sign In</p>
      {/* OAuth Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          className="flex items-center gap-2"
          onClick={() => signIn("github")}
        >
          <FaGithub /> GitHub
        </Button>
        <Button
          className="flex items-center gap-2"
          onClick={() => signIn("google")}
        >
          <FaGoogle /> Google
        </Button>
      </div>

      <div className="relative flex items-center py-5">
        <div className="flex-grow border-t border-border"></div>
        <span className="mx-4 flex-shrink text-xs text-muted-foreground">
          OR CONTINUE WITH
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <Separator />

      {/* Registration Link */}
      <p className="text-center text-sm">
        Don{"'"}t have an account?{" "}
        <Link href="/register" className="font-semibold underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
