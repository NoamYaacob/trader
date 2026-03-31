import type { DefaultSession } from "next-auth";

// Extend the built-in session types to include user.id,
// which we attach in the jwt + session callbacks.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
