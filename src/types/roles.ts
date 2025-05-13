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
 * Get role badge variant based on role
 */
export function getRoleBadgeVariant(role: string): "gray" | "purple" | "blue" | "green" | "yellow" {
  switch (role) {
    case Role.ADMINISTRATOR:
      return "purple";
    case Role.PROFESSOR:
      return "blue";
    case Role.STUDENT:
      return "green";
    case Role.BETA_TESTER:
      return "yellow";
    default:
      return "gray";
  }
}