import { JWT } from "next-auth/jwt";
import { User as NextAuthUser, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { conToDb } from "./db"; // your DB connection util
import { User } from "@/models/User"; // your Mongoose User model
import { IUser } from "@/models/User";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";

export const authOptions: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>> | undefined,
        req: Request
      ) {
        // Validate types and presence
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          throw new Error("Missing or invalid email or password");
        }

        try {
          // Connect to DB
          await conToDb();

          // Find user by email
          const user = await User.findOne<IUser>({
            email: credentials.email,
          }).lean();

          if (!user) {
            throw new Error("No user found with this email");
          }

          // Validate password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user object expected by NextAuth
          return {
            id: user._id?.toString(),
            email: user.email,
          };
        } catch (error) {
          console.error("Error in authorize callback:", error);
          // Return null on error per NextAuth contract
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
