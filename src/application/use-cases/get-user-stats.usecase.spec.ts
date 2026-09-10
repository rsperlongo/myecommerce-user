import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import { GetUserStatsUseCase } from './get-user-stats.usecase';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

describe('GetUserStatsUseCase', () => {
  const getStatsMock = jest.fn();
  const repository = {
    getStats: getStatsMock,
  } as unknown as IUserRepository;
  const useCase = new GetUserStatsUseCase(repository);

  beforeEach(() => {
    jest.clearAllMocks();
    getStatsMock.mockResolvedValue({
      total: 0,
      active: 0,
      inactive: 0,
      byRole: {},
      recentRegistrations: 0,
    });
  });

  it('requests all roles for an admin', async () => {
    const admin = new UserEntity({ id: 'admin-id', roles: [UserRole.ADMIN] });

    await useCase.execute(admin);

    expect(getStatsMock).toHaveBeenCalledWith([
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.USER,
      UserRole.GUEST,
    ]);
  });

  it('limits managers to user and guest statistics', async () => {
    const manager = new UserEntity({
      id: 'manager-id',
      roles: [UserRole.MANAGER],
    });

    await useCase.execute(manager);

    expect(getStatsMock).toHaveBeenCalledWith([UserRole.USER, UserRole.GUEST]);
  });

  it('rejects users without management permission', async () => {
    const user = new UserEntity({ id: 'user-id', roles: [UserRole.USER] });

    await expect(useCase.execute(user)).rejects.toBeInstanceOf(
      InsufficientPermissionsException,
    );
    expect(getStatsMock).not.toHaveBeenCalled();
  });
});