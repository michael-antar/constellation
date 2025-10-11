"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div>
      <button onClick={() => signIn("google")}>Sign In with Google</button>
      <button onClick={() => signIn("github")}>Sign In with GitHub</button>
    </div>
  );
}
