"use client";

import { useSession } from "next-auth/react";
import { isAdmin, isProfessor, isStudent, Role } from "@/types/roles";
import { useAuth } from "@/contexts/AuthContext";

interface UserRoleData {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isProfessor: boolean;
  isStudent: boolean;
  role: Role | null;
  hasPermission: (requiredRole: Role) => boolean;
}

/**
 * Hook to check user roles and permissions
 * Uses NextAuth session as primary source of truth with Firebase Auth as fallback
 * 
 * @returns UserRoleData object with role checks and permission function
 */
export function useUserRole(): UserRoleData {
  const { data: session, status: sessionStatus } = useSession();
  const { userRole, isLoading: authLoading } = useAuth();
  
  // First check next-auth session, then fallback to auth context
  const role = (session?.user?.role as Role) ?? userRole;
  const isLoading = sessionStatus === "loading" || authLoading;
  const isAuthenticated = sessionStatus === "authenticated" || !!userRole;
  
  // Check if user has a specific permission level
  const hasPermission = (requiredRole: Role): boolean => {
    if (!role) return false;
    
    switch (requiredRole) {
      case Role.ADMINISTRATOR:
        return isAdmin(role);
      case Role.PROFESSOR:
        return isProfessor(role);
      case Role.STUDENT:
        return isStudent(role);
      case Role.USER:
        return true; // All authenticated users have basic user permissions
      default:
        return false;
    }
  };
  
  return {
    isAuthenticated,
    isLoading,
    isAdmin: role ? isAdmin(role) : false,
    isProfessor: role ? isProfessor(role) : false,
    isStudent: role ? isStudent(role) : false,
    role: role ?? null,
    hasPermission,
  };
} 