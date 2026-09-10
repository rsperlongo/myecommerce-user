import { Injectable, Inject } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole, hasPermission } from '../../domain/enums/user-role.enum';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import type {
  IUserRepository,
  UserStats,
} from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUserStatsUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(requestedBy: UserEntity): Promise<UserStats> {
    const requesterRole = requestedBy.getHighestRole();
    if (!hasPermission(requesterRole, UserRole.MANAGER)) {
      throw new InsufficientPermissionsException(
        'Permission to view user statistics (requires MANAGER or ADMIN)',
        requesterRole,
      );
    }

    const roles = this.getVisibleRoles(requesterRole);
    const stats = await this.userRepository.getStats(roles);

    return stats;
  }

  private getVisibleRoles(requesterRole: UserRole): UserRole[] {
    if (requesterRole === UserRole.ADMIN) {
      return [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST];
    }

    return [UserRole.USER, UserRole.GUEST];
  }
}
