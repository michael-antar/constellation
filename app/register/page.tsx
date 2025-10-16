"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Make a request to registration API route
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      toast.success("Account created successfully!");
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/", // Redirect to home page after sign in
      });
    } else {
      const errorData = await response.json();
      toast.error(
        errorData.message || "Registration failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="border-b">
        <div className="container p-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Sparkle />
            Constellation
          </Link>
        </div>
      </header>
      <main className="flex flex-grow items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Choose your preferred sign-up method
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => signIn("github")}>
                <FaGithub className="mr-2 h-4 w-4" /> GitHub
              </Button>
              <Button variant="outline" onClick={() => signIn("google")}>
                <FaGoogle className="mr-2 h-4 w-4" /> Google
              </Button>
            </div>

            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-4 flex-shrink text-xs text-muted-foreground">
                OR CONTINUE WITH EMAIL
              </span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
