'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Role } from '@/types/roles';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

interface AuthContextType {
  user: User | null;
  userRole: Role | null;
  isLoading: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseRole, setFirebaseRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  
  // Derive userRole from session (priority) or Firebase claims
  const userRole = session?.user?.role ?? firebaseRole;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Get the ID token with claims
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          const roleClaim = idTokenResult.claims.role as Role | undefined;
          
          // Set the role from claims or default to USER
          setFirebaseRole(roleClaim ?? Role.USER);
        } catch (error) {
          console.error('Error getting auth token claims:', error);
          setFirebaseRole(Role.USER);
        }
      } else {
        setFirebaseRole(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);



  const signOutUser = useCallback(async () => {
    try {
      // Sign out from both auth systems
      await Promise.all([
        signOut(auth),
        nextAuthSignOut()
      ]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    userRole,
    isLoading,
    signOutUser,
  }), [user, userRole, isLoading, signOutUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 