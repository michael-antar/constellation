"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

export default function SignIn() {
  return (
    <div>
      <Button onClick={() => signIn("google")}>Sign In with Google</Button>
      <Button onClick={() => signIn("github")}>Sign In with GitHub</Button>
    </div>
  );
}
