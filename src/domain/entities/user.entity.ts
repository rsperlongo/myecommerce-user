import { UserRole } from '../enums/user-role.enum';

export class UserEntity {
  id!: string;
  email!: string;
  password!: string;
  roles!: UserRole[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial?: Partial<UserEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.roles.includes(role));
  }

  getHighestRole(): UserRole {
    const roleOrder = [
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.USER,
      UserRole.GUEST,
    ];
    for (const role of roleOrder) {
      if (this.roles.includes(role)) {
        return role;
      }
    }
    return UserRole.GUEST;
  }
}
