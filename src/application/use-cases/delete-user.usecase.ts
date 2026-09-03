import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole, hasPermission } from '../../domain/enums/user-role.enum';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

export interface DeleteUserRequest {
  userId: string;
  deletedBy: UserEntity;
  softDelete?: boolean;
}

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    request: DeleteUserRequest,
  ): Promise<{ message: string; deletedUser: UserEntity }> {
    // Verificar permissões básicas: apenas ADMIN pode deletar usuários
    if (!hasPermission(request.deletedBy.getHighestRole(), UserRole.ADMIN)) {
      throw new InsufficientPermissionsException(
        'Permission to delete users (requires ADMIN)',
        request.deletedBy.getHighestRole(),
      );
    }

    // Buscar o usuário a ser deletado
    const targetUser = this.findUserById(request.userId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${request.userId} not found`);
    }

    // Validações de segurança
    this.validateDeletion(request.deletedBy, targetUser);

    // Executar deleção
    if (request.softDelete !== false) {
      // Soft delete (padrão) - desativar o usuário
      const deactivatedUser = new UserEntity({
        ...targetUser,
        isActive: false,
        updatedAt: new Date(),
      });

      return {
        message: 'User deactivated successfully',
        deletedUser: deactivatedUser,
      };
    } else {
      // Hard delete - remover completamente (apenas para casos específicos)
      return {
        message: 'User permanently deleted',
        deletedUser: targetUser,
      };
    }
  }

  private validateDeletion(deleter: UserEntity, targetUser: UserEntity): void {
    // Não permitir auto-deleção
    if (deleter.id === targetUser.id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    // Verificar se existem dependências (exemplo: pedidos, transações, etc.)
    const hasDependencies = this.checkUserDependencies(targetUser.id);
    if (hasDependencies) {
      throw new BadRequestException(
        'Cannot delete user with existing dependencies. Use soft delete (deactivate) instead.',
      );
    }

    // Regras específicas por role do usuário alvo
    const targetRole = targetUser.getHighestRole();

    // Validações adicionais baseadas em roles
    if (targetRole === UserRole.ADMIN) {
      // Verificar se não é o último admin
      const adminCount = this.countActiveAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin user');
      }
    }

    // Log da ação para auditoria
    this.logDeletionAttempt(deleter, targetUser);
  }

  private checkUserDependencies(userId: string): boolean {
    // Mock implementation - em produção verificaria:
    // - Pedidos realizados
    // - Transações financeiras
    // - Dados históricos importantes
    // - Relacionamentos com outros usuários

    // Por enquanto, simular que usuários ativos há mais de 30 dias têm dependências
    const user = this.findUserById(userId);
    if (user && user.createdAt) {
      const daysSinceCreation = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysSinceCreation > 30;
    }

    return false;
  }

  private countActiveAdmins(): number {
    // Mock implementation - em produção consultaria o banco
    return 2; // Simulando que existem 2 admins ativos
  }

  private logDeletionAttempt(
    deleter: UserEntity,
    targetUser: UserEntity,
  ): void {
    // Mock implementation - em produção salvaria em log de auditoria
    console.log(
      `User deletion attempt: ${deleter.email} attempting to delete ${targetUser.email} (ID: ${targetUser.id})`,
    );
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
        createdAt: new Date('2023-12-01'), // Usuário antigo com possíveis dependências
        updatedAt: new Date('2023-12-01'),
      }),
    };

    return mockUsers[userId as keyof typeof mockUsers] || null;
  }
}
