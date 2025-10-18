import { DefaultSession } from "next-auth";

import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}

// Does not work
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user: {
      role: string;
    } & DefaultJWT;
  }
}
