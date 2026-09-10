import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

describe('AuthService', () => {
  const signMock = jest.fn().mockReturnValue('signed-token');
  const verifyAsyncMock = jest.fn();
  const findByEmailMock = jest.fn<() => Promise<UserEntity | null>>();
  const jwtService = {
    sign: signMock,
    verifyAsync: verifyAsyncMock,
  } as unknown as JwtService;
  const repository = {
    findByEmail: findByEmailMock,
  } as unknown as IUserRepository;
  const service = new AuthService(jwtService, repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticates an active user with the correct password', async () => {
    const password = await bcrypt.hash('secret123', 4);
    const user = new UserEntity({
      id: 'user-id',
      email: 'user@example.com',
      password,
      roles: [UserRole.USER],
      isActive: true,
    });
    findByEmailMock.mockResolvedValue(user);

    const authentication = service.authenticate(user.email, 'secret123');
    await expect(authentication).resolves.toBe(user);
  });

  it('rejects invalid credentials', async () => {
    findByEmailMock.mockResolvedValue(null);

    const authentication = service.authenticate(
      'unknown@example.com',
      'secret123',
    );
    await expect(authentication).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an incorrect password for an existing user', async () => {
    const user = new UserEntity({
      id: 'user-id',
      email: 'user@example.com',
      password: await bcrypt.hash('correct-password', 4),
      roles: [UserRole.USER],
      isActive: true,
    });
    findByEmailMock.mockResolvedValue(user);

    const authentication = service.authenticate(
      user.email,
      'incorrect-password',
    );

    await expect(authentication).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('generates a token using the user claims', () => {
    const user = new UserEntity({
      id: 'user-id',
      email: 'user@example.com',
      roles: [UserRole.USER],
      isActive: false,
    });

    service.generateToken(user);

    expect(signMock).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      roles: user.roles,
      isActive: false,
    });
  });
});
