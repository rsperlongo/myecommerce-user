import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, hasPermission } from '../../../domain/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roles) {
      throw new ForbiddenException('User not authenticated or roles not found');
    }

    const userHighestRole = this.getHighestRole(user.roles);
    const hasRequiredPermission = requiredRoles.some(role => 
      hasPermission(userHighestRole, role)
    );

    if (!hasRequiredPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}, User role: ${userHighestRole}`
      );
    }

    return true;
  }

  private getHighestRole(userRoles: UserRole[]): UserRole {
    const roleOrder = [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST];
    for (const role of roleOrder) {
      if (userRoles.includes(role)) {
        return role;
      }
    }
    return UserRole.GUEST;
  }
}