export class InsufficientPermissionsException extends Error {
  constructor(requiredRole: string, userRole: string) {
    super(`Insufficient permissions. Required role: ${requiredRole}, User role: ${userRole}`);
    this.name = 'InsufficientPermissionsException';
  }
}