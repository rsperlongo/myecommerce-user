import { Injectable, Inject } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  UserRole,
  canCreateUserWithRole,
} from '../../domain/enums/user-role.enum';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

export interface CreateUserWithRolesRequest {
  email: string;
  password: string;
  roles: UserRole[];
  createdBy: UserEntity;
}

@Injectable()
export class CreateUserWithRolesUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: CreateUserWithRolesRequest): Promise<UserEntity> {
    // Validar se o criador tem permissão para criar usuários com os roles solicitados
    const creatorHighestRole = request.createdBy.getHighestRole();

    for (const role of request.roles) {
      if (!canCreateUserWithRole(creatorHighestRole, role)) {
        throw new InsufficientPermissionsException(
          `Permission to create user with role ${role}`,
          creatorHighestRole,
        );
      }
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Criar nova entidade de usuário
    const newUser = new UserEntity({
      email: request.email,
      password: request.password, // Será hasheado no service
      roles: request.roles.length > 0 ? request.roles : [UserRole.USER],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.save(newUser);
  }

  /**
   * Obter roles disponíveis que um usuário pode atribuir a outros usuários
   */
  getAvailableRolesForUser(userRole: UserRole): UserRole[] {
    switch (userRole) {
      case UserRole.ADMIN:
        return [
          UserRole.ADMIN,
          UserRole.MANAGER,
          UserRole.USER,
          UserRole.GUEST,
        ];
      case UserRole.MANAGER:
        return [UserRole.USER, UserRole.GUEST];
      case UserRole.USER:
        return [UserRole.GUEST];
      default:
        return [];
    }
  }
}
