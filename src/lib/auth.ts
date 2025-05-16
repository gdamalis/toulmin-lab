import { NextAuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Role } from "@/types/roles";
import { verifyToken, FirebaseToken } from "@/lib/auth/firebase";

// Extended user type to include role
type ExtendedUser = User & {
  role: Role;
  id: string;
};

// Extended JWT with additional fields
interface ExtendedJWT {
  role?: Role;
  uid?: string;
  provider?: string;
}

// Extended session with provider info
interface ExtendedSession extends Session {
  provider?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      /**
       * A single credentials provider that receives a Firebase ID token
       * produced client-side after a successful Firebase authentication
       * (email/password, Google, etc.).
       */
      id: "firebase",
      name: "Firebase",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken;
        if (!idToken) return null;

        const verification = await verifyToken(idToken);
        if (!verification.success || !verification.token) return null;

        type DecodedToken = FirebaseToken & {
          email?: string;
          name?: string;
          picture?: string;
        };

        const decoded = verification.token as DecodedToken;

        const uid = decoded.uid;
        const email = decoded.email ?? "";
        const name = decoded.name ?? email.split("@")[0] ?? "User";
        const picture = decoded.picture;
        const role = decoded.role ?? Role.USER;

        // Ensure the user exists / is updated in our DB
        try {
          await fetch(`${process.env.NEXTAUTH_URL ?? ""}/api/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              userId: uid,
              name,
              email,
              picture,
            }),
          });
        } catch (err) {
          console.error("Error syncing user in authorize:", err);
        }

        return {
          id: uid,
          email,
          name,
          image: picture,
          role,
        } as ExtendedUser;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    // Set maximum age to match session
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async signIn({ user }) {
      return !!user;
    },
    async jwt({ token, user }) {
      if (user) {
        // Add essential user data to the token
        (token as ExtendedJWT).role = (user as ExtendedUser).role;
        (token as ExtendedJWT).uid = (user as ExtendedUser).id;
        token.email = user.email;
      }
      
      return token;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      if (session.user) {
        // Add essential user data from token to the session
        session.user.role = (token as ExtendedJWT).role as Role;
        session.user.id = (token as ExtendedJWT).uid as string;
        session.user.email = token.email as string;
      }
      return session as ExtendedSession;
    }
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth",
    error: "/auth?error=true"
  }
}; 