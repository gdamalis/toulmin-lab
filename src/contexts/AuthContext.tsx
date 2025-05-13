'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Role } from '@/types/roles';

interface AuthContextType {
  user: User | null;
  userRole: Role | null;
  isLoading: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isLoading: true,
  signOutUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Get the ID token with claims
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          const roleClaim = idTokenResult.claims.role as Role | undefined;
          
          // Set the role from claims or default to USER
          setUserRole(roleClaim ?? Role.USER);
        } catch (error) {
          console.error('Error getting auth token claims:', error);
          setUserRole(Role.USER);
        }
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
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