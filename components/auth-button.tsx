"use client";

import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
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
import { FaGoogle, FaGithub } from "react-icons/fa";
import { User } from "lucide-react";

// Pass the session as a prop
type AuthButtonProps = {
  session: Session | null;
};

export function AuthButton({ session }: AuthButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
      <Button
        variant="ghost"
        onClick={() => signOut()}
        className="w-full justify-start"
      >
        Sign Out
      </Button>
    </div>
  );
}

function SignedOutContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Use the signIn function for credentials
    signIn("credentials", { email, password, redirect: false });
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

      <div className="relative">
        <Separator className="absolute top-1/2" />
        <p className="text-center text-xs text-muted-foreground bg-popover px-2">
          OR CONTINUE WITH
        </p>
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
        <Button type="submit">Sign In</Button>
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
