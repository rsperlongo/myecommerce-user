export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  USER = 'user',
  GUEST = 'guest'
}

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
  [UserRole.MANAGER]: [UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
  [UserRole.USER]: [UserRole.USER, UserRole.GUEST],
  [UserRole.GUEST]: [UserRole.GUEST]
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole].includes(requiredRole);
}

export function canCreateUserWithRole(creatorRole: UserRole, targetRole: UserRole): boolean {
  // Admins podem criar qualquer role
  if (creatorRole === UserRole.ADMIN) {
    return true;
  }
  
  // Managers podem criar USER e GUEST
  if (creatorRole === UserRole.MANAGER) {
    return [UserRole.USER, UserRole.GUEST].includes(targetRole);
  }
  
  // Users podem apenas criar GUEST
  if (creatorRole === UserRole.USER) {
    return targetRole === UserRole.GUEST;
  }
  
  // GUEST não pode criar usuários
  return false;
}