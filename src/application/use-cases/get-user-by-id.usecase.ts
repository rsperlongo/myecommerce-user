import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole, hasPermission } from '../../domain/enums/user-role.enum';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

export interface GetUserByIdRequest {
  userId: string;
  requestedBy: UserEntity;
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  execute(request: GetUserByIdRequest): UserEntity {
    const requesterRole = request.requestedBy.getHighestRole();

    // Verificar permissões básicas: ADMIN, MANAGER ou o próprio usuário
    if (!hasPermission(requesterRole, UserRole.USER)) {
      throw new InsufficientPermissionsException(
        'Permission to view user details',
        requesterRole,
      );
    }

    // Buscar o usuário
    const targetUser = this.findUserById(request.userId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${request.userId} not found`);
    }

    // Verificar se o usuário pode visualizar este registro específico
    const canViewUser = this.canViewUser(request.requestedBy, targetUser);

    if (!canViewUser) {
      throw new InsufficientPermissionsException(
        `Permission to view user with roles: ${targetUser.roles.join(', ')}`,
        requesterRole,
      );
    }

    return targetUser;
  }

  private canViewUser(requester: UserEntity, targetUser: UserEntity): boolean {
    const requesterRole = requester.getHighestRole();
    const targetHighestRole = targetUser.getHighestRole();

    // Usuário pode sempre ver seu próprio perfil
    if (requester.id === targetUser.id) {
      return true;
    }

    // ADMIN pode ver todos
    if (requesterRole === UserRole.ADMIN) {
      return true;
    }

    // MANAGER pode ver USER e GUEST
    if (requesterRole === UserRole.MANAGER) {
      return [UserRole.USER, UserRole.GUEST].includes(targetHighestRole);
    }

    // USER só pode ver GUEST (além do próprio perfil)
    if (requesterRole === UserRole.USER) {
      return targetHighestRole === UserRole.GUEST;
    }

    return false;
  }

  private findUserById(userId: string): UserEntity | null {
    // Mock implementation
    const mockUsers = {
      '1': new UserEntity({
        id: '1',
        email: 'admin@test.com',
        password: 'hashedpassword',
        roles: [UserRole.ADMIN],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }),
      '2': new UserEntity({
        id: '2',
        email: 'manager@test.com',
        password: 'hashedpassword',
        roles: [UserRole.MANAGER],
        isActive: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      }),
      '3': new UserEntity({
        id: '3',
        email: 'user@test.com',
        password: 'hashedpassword',
        roles: [UserRole.USER],
        isActive: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      }),
      '4': new UserEntity({
        id: '4',
        email: 'guest@test.com',
        password: 'hashedpassword',
        roles: [UserRole.GUEST],
        isActive: false,
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      }),
    };

    return mockUsers[userId as keyof typeof mockUsers] || null;
  }
}
