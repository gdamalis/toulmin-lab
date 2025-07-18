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

        // The role should already be set as a custom claim by this point
        // If it's not set for any reason, default to USER
        const role = decoded.role ?? Role.USER;
        const uid = decoded.uid;
        const email = decoded.email ?? "";
        const name = decoded.name ?? email.split("@")[0] ?? "User";
        const picture = decoded.picture;

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
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
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