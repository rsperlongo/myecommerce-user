import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  UserRole,
  canCreateUserWithRole,
  hasPermission,
} from '../../domain/enums/user-role.enum';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

export interface UpdateUserRequest {
  userId: string;
  email?: string;
  password?: string;
  roles?: UserRole[];
  isActive?: boolean;
  updatedBy: UserEntity;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: UpdateUserRequest): Promise<UserEntity> {
    const updaterRole = request.updatedBy.getHighestRole();

    // Verificar permissões básicas: pelo menos MANAGER para atualizar outros usuários
    if (
      !hasPermission(updaterRole, UserRole.MANAGER) &&
      request.updatedBy.id !== request.userId
    ) {
      throw new InsufficientPermissionsException(
        'Permission to update other users (requires MANAGER or ADMIN)',
        updaterRole,
      );
    }

    // Buscar o usuário a ser atualizado
    const targetUser = await this.userRepository.findById(request.userId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${request.userId} not found`);
    }

    // Verificar se pode atualizar este usuário específico
    const canUpdateUser = this.canUpdateUser(request.updatedBy, targetUser);
    if (!canUpdateUser) {
      const targetRole = targetUser.getHighestRole();
      throw new InsufficientPermissionsException(
        `Permission to update user with role ${targetRole}`,
        updaterRole,
      );
    }

    // Validar alterações de roles se solicitadas
    if (request.roles && request.roles.length > 0) {
      this.validateRoleChanges(request.updatedBy, targetUser, request.roles);
    }

    // Validar alteração de email se solicitada
    if (request.email && request.email !== targetUser.email) {
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser && existingUser.id !== request.userId) {
        throw new Error('User with this email already exists');
      }
    }

    // Criar usuário atualizado
    const password = request.password
      ? await this.hashPassword(request.password)
      : targetUser.password;

    const updatedUser = new UserEntity({
      ...targetUser,
      email: request.email || targetUser.email,
      password,
      roles: request.roles || targetUser.roles,
      isActive:
        request.isActive !== undefined ? request.isActive : targetUser.isActive,
      updatedAt: new Date(),
    });

    return (
      (await this.userRepository.update(request.userId, updatedUser)) ??
      updatedUser
    );
  }

  private canUpdateUser(updater: UserEntity, targetUser: UserEntity): boolean {
    const updaterRole = updater.getHighestRole();
    const targetRole = targetUser.getHighestRole();

    // Usuário pode sempre editar seu próprio perfil (exceto roles)
    if (updater.id === targetUser.id) {
      return true;
    }

    // ADMIN pode atualizar todos
    if (updaterRole === UserRole.ADMIN) {
      return true;
    }

    // MANAGER pode atualizar USER e GUEST
    if (updaterRole === UserRole.MANAGER) {
      return [UserRole.USER, UserRole.GUEST].includes(targetRole);
    }

    return false;
  }

  private validateRoleChanges(
    updater: UserEntity,
    targetUser: UserEntity,
    newRoles: UserRole[],
  ): void {
    const updaterRole = updater.getHighestRole();

    // Usuário não pode alterar os próprios roles
    if (updater.id === targetUser.id) {
      throw new InsufficientPermissionsException(
        'Permission to change own roles (not allowed)',
        updaterRole,
      );
    }

    // Validar se o usuário pode atribuir os novos roles
    for (const newRole of newRoles) {
      if (!canCreateUserWithRole(updaterRole, newRole)) {
        throw new InsufficientPermissionsException(
          `Permission to assign role ${newRole}`,
          updaterRole,
        );
      }
    }

    // Validar se pode remover roles existentes
    const currentRoles = targetUser.roles;
    const removedRoles = currentRoles.filter(
      (role) => !newRoles.includes(role),
    );

    for (const removedRole of removedRoles) {
      if (!canCreateUserWithRole(updaterRole, removedRole)) {
        throw new InsufficientPermissionsException(
          `Permission to remove role ${removedRole}`,
          updaterRole,
        );
      }
    }
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
