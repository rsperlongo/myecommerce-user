import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersController } from './controllers/users.controller';
import { RolesGuard } from './guards/roles.guard';

// Use Cases
import { CreateUserWithRolesUseCase } from '../../application/use-cases/create-user-with-roles.usecase';
import { GetUsersUseCase } from '../../application/use-cases/get-users.usecase';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.usecase';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.usecase';

import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'super-secret-jwt'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '3600s'),
        },
      }),
    }),
  ],
  providers: [
    // Services
    AuthService,
    JwtStrategy,
    RolesGuard,

    // Use Cases
    CreateUserWithRolesUseCase,
    GetUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,

    // Repository Mock (TODO: Substituir por implementação real)
    {
      provide: 'IUserRepository',
      useValue: {
        findByEmail: () => {
          // Mock implementation - sempre retorna null para permitir criação
          return Promise.resolve(null);
        },
        save: (email: string, passwordHash: string) => {
          // Mock implementation que retorna um UserEntity válido
          return Promise.resolve(
            new UserEntity({
              id: uuidv4(),
              email,
              password: passwordHash,
              roles: [UserRole.USER],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          );
        },
        findById: () => {
          // Mock implementation
          return Promise.resolve(null);
        },
        findAll: () => {
          // Mock implementation
          return Promise.resolve([]);
        },
        update: (id: string, data: unknown) => {
          // Mock implementation
          return Promise.resolve(
            new UserEntity({
              id,
              ...(data as object),
              updatedAt: new Date(),
            }),
          );
        },
        delete: () => {
          // Mock implementation
          return Promise.resolve(true);
        },
      },
    },
  ],
  controllers: [AuthController, UsersController],
  exports: [AuthService, JwtModule, RolesGuard],
})
export class AuthModule {}
