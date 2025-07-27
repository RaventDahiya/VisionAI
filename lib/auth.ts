// app/api/auth/[...nextauth]/options.ts

// Notice the change here: AuthOptions is a default export
import NextAuth from "next-auth";
// These types are needed for the callbacks
import { JWT } from "next-auth/jwt";
import { User as NextAuthUser, Session } from "next-auth";

import Credentials from "next-auth/providers/credentials";
import { conToDb } from "./db";
import { User } from "@/models/User";
import { IUser } from "@/models/User"; // <-- 1. IMPORT YOUR USER INTERFACE
import bcrypt from "bcryptjs";

export const authOptions: NextAuth.AuthOptions = {
  // Use NextAuth.AuthOptions for clarity
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await conToDb();

          // <-- 2. STRONGLY TYPE THE MONGOOSE QUERY RESULT
          // This tells TypeScript the exact shape of the 'user' object.
          const user = await User.findOne<IUser>({
            email: credentials.email,
          }).lean();

          if (!user) {
            console.log("No user found with this email.");
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password // Now TypeScript knows 'user.password' is a string
          );

          if (!isPasswordValid) {
            console.log("Invalid password.");
            return null;
          }

          // Return the object that matches the 'User' type in your next-auth.d.ts
          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          console.error("Error in authorize callback:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // <-- 3. ADD EXPLICIT TYPES TO CALLBACK PARAMETERS
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        // On sign-in, the user object is available. Persist the ID to the token.
        token.id = user.id;
      }
      return token;
    },
    // <-- 3. ADD EXPLICIT TYPES TO CALLBACK PARAMETERS
    async session({ session, token }: { session: Session; token: JWT }) {
      // The session object is what the client sees.
      // Make the user ID available on the session.user object.
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // session, secret, and pages remain the same
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
