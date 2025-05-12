/**
 * Standardized role definitions for the application
 */
export enum Role {
  USER = 'user',
  STUDENT = 'student',
  BETA_TESTER = 'beta_tester',
  PROFESSOR = 'professor',
  ADMINISTRATOR = 'administrator'
}

/**
 * Helper functions for role-based checks
 */

/**
 * Check if a role has administrative privileges
 */
export function isAdmin(role: Role | string): boolean {
  return role === Role.ADMINISTRATOR;
}

/**
 * Check if a role has professor privileges (includes administrators)
 */
export function isProfessor(role: Role | string): boolean {
  return role === Role.PROFESSOR || isAdmin(role);
}

/**
 * Check if a role has student privileges
 */
export function isStudent(role: Role | string): boolean {
  return role === Role.STUDENT || role === Role.BETA_TESTER;
}

/**
 * Check if a role can create arguments
 */
export function canCreateArguments(role: Role | string): boolean {
  return role !== Role.USER;
}

/**
 * Get all available roles as an array
 */
export function getAllRoles(): Role[] {
  return Object.values(Role) as Role[];
}

/**
 * Get role badge styling
 */
export function getRoleBadgeClasses(role: string): string {
  const baseClasses = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium";
  
  switch (role) {
    case Role.ADMINISTRATOR:
      return `${baseClasses} bg-purple-100 text-purple-700`;
    case Role.PROFESSOR:
      return `${baseClasses} bg-blue-100 text-blue-700`;
    case Role.STUDENT:
      return `${baseClasses} bg-green-100 text-green-700`;
    case Role.BETA_TESTER:
      return `${baseClasses} bg-yellow-100 text-yellow-700`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-700`;
  }
} 