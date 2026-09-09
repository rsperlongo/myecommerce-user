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

  async execute(request: GetUsersRequest): Promise<GetUsersResponse> {
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

    const page = request.page || 1;
    const limit = request.limit || 10;
    const result = await this.userRepository.findAll({
      page,
      limit,
      search: request.search,
      roles: rolesToFilter,
      isActive: request.isActive,
      sortBy: request.sortBy as 'email' | 'createdAt' | 'updatedAt' | undefined,
      sortOrder: request.sortOrder,
    });

    return {
      users: result.users,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
