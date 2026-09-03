import { Injectable, Inject } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole, hasPermission } from '../../domain/enums/user-role.enum';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

export interface GetUsersRequest {
  requestedBy: UserEntity;
  page?: number;
  limit?: number;
  search?: string;
  roles?: UserRole[];
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface GetUsersResponse {
  users: UserEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  execute(request: GetUsersRequest): GetUsersResponse {
    // Verificar permissões: apenas ADMIN e MANAGER podem listar usuários
    const requesterRole = request.requestedBy.getHighestRole();

    if (!hasPermission(requesterRole, UserRole.MANAGER)) {
      throw new InsufficientPermissionsException(
        'Permission to list users (requires MANAGER or ADMIN)',
        requesterRole,
      );
    }

    // MANAGER só pode ver usuários com roles inferiores (USER, GUEST)
    // ADMIN pode ver todos os usuários
    let allowedRoles: UserRole[] = [];

    if (requesterRole === UserRole.ADMIN) {
      allowedRoles = [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.USER,
        UserRole.GUEST,
      ];
    } else if (requesterRole === UserRole.MANAGER) {
      allowedRoles = [UserRole.USER, UserRole.GUEST];
    }

    // Se roles específicos foram solicitados, validar se o usuário pode visualizá-los
    let rolesToFilter = request.roles;
    if (rolesToFilter) {
      const unauthorizedRoles = rolesToFilter.filter(
        (role) => !allowedRoles.includes(role),
      );
      if (unauthorizedRoles.length > 0) {
        throw new InsufficientPermissionsException(
          `Permission to view users with roles: ${unauthorizedRoles.join(', ')}`,
          requesterRole,
        );
      }
    } else {
      rolesToFilter = allowedRoles;
    }

    // Simular busca paginada (implementação real dependeria do repository)
    const mockUsers = this.generateMockUsers(rolesToFilter);

    return {
      users: mockUsers.slice(
        ((request.page || 1) - 1) * (request.limit || 10),
        (request.page || 1) * (request.limit || 10),
      ),
      total: mockUsers.length,
      page: request.page || 1,
      limit: request.limit || 10,
      totalPages: Math.ceil(mockUsers.length / (request.limit || 10)),
    };
  }

  private generateMockUsers(allowedRoles: UserRole[]): UserEntity[] {
    // Mock implementation - em produção isso viria do repository
    const mockUsers: UserEntity[] = [
      new UserEntity({
        id: '1',
        email: 'admin@test.com',
        password: 'hashedpassword',
        roles: [UserRole.ADMIN],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }),
      new UserEntity({
        id: '2',
        email: 'manager@test.com',
        password: 'hashedpassword',
        roles: [UserRole.MANAGER],
        isActive: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      }),
      new UserEntity({
        id: '3',
        email: 'user@test.com',
        password: 'hashedpassword',
        roles: [UserRole.USER],
        isActive: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      }),
      new UserEntity({
        id: '4',
        email: 'guest@test.com',
        password: 'hashedpassword',
        roles: [UserRole.GUEST],
        isActive: false,
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      }),
    ];

    return mockUsers.filter((user) => {
      // Filtrar por roles permitidos
      const hasAllowedRole = user.roles.some((role) =>
        allowedRoles.includes(role),
      );
      return hasAllowedRole;
    });
  }
}
