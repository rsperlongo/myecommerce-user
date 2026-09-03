import { UserRole } from '../../../domain/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty({ example: 'user@example.com' })
  email!: string;
  @ApiProperty({ enum: UserRole, isArray: true })
  roles!: UserRole[];
  @ApiProperty()
  isActive!: boolean;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
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
