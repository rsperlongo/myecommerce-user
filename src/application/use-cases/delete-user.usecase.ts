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
    const targetUser = await this.userRepository.findById(request.userId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${request.userId} not found`);
    }

    // Validações de segurança
    await this.validateDeletion(request.deletedBy, targetUser);

    // Executar deleção
    if (request.softDelete !== false) {
      // Soft delete (padrão) - desativar o usuário
      const deactivatedUser = await this.userRepository.softDelete(
        request.userId,
      );
      return {
        message: 'User deactivated successfully',
        deletedUser: deactivatedUser ?? targetUser,
      };
    } else {
      await this.userRepository.delete(request.userId);
      return {
        message: 'User permanently deleted',
        deletedUser: targetUser,
      };
    }
  }

  private async validateDeletion(
    deleter: UserEntity,
    targetUser: UserEntity,
  ): Promise<void> {
    // Não permitir auto-deleção
    if (deleter.id === targetUser.id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    // Regras específicas por role do usuário alvo
    const targetRole = targetUser.getHighestRole();

    // Validações adicionais baseadas em roles
    if (targetRole === UserRole.ADMIN) {
      // Verificar se não é o último admin
      const adminCount = await this.userRepository.countActiveAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin user');
      }
    }

    // Log da ação para auditoria
    this.logDeletionAttempt(deleter, targetUser);
  }

  private logDeletionAttempt(
    deleter: UserEntity,
    targetUser: UserEntity,
  ): void {
    console.log(
      `User deletion attempt: ${deleter.email} attempting to delete ${targetUser.email} (ID: ${targetUser.id})`,
    );
  }
}
