import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";
import { signInSchema } from "./lib/zod";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  return {
    adapter: NeonAdapter(pool),
    providers: [
      Google,
      GitHub,
      Credentials({
        credentials: {
          email: {},
          password: {},
        },
        authorize: async (credentials) => {
          try {
            // Validate input using Zod schema
            const { email, password } = await signInSchema.parseAsync(
              credentials
            );

            // Query database for the user
            const result = await pool.query(
              "SELECT * FROM users WHERE email = $1",
              [email]
            );
            const user = result.rows[0];

            // If no user is found, or if they don't have a password (e.g., OAuth user), reject
            if (!user || !user.password) {
              return null;
            }

            // Compare the provided password with the stored hash
            const passwordsMatch = await compare(password, user.password);

            // If passwords match, return the user object. Otherwise, reject
            if (passwordsMatch) {
              return user;
            } else {
              return null;
            }
          } catch (error) {
            console.error("Authorization error: ", error);
            return null;
          }
        },
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      // Fired when a token is created.
      // Add user id to token
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },

      // Fired when a session is accessed.
      // Add user id to client-side session
      async session({ session, token }) {
        if (session.user && token.id) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  };
});
