import { UserRole } from '../../../domain/enums/user-role.enum';

export class UserResponseDto {
  id!: string;
  email!: string;
  roles!: UserRole[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: any): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
