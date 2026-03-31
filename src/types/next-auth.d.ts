import type { DefaultSession } from "next-auth";

// Extend built-in NextAuth types to include user.id and user.role,
// which are attached in the jwt + session callbacks.
declare module "next-auth" {
  interface Session {
    user: {
      id:   string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  // Extends the User object returned by authorize() so the jwt callback
  // can pick up the role without TypeScript errors.
  interface User {
    role?: "USER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?:   string;
    role?: "USER" | "ADMIN";
  }
}
