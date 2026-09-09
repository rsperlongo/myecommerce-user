import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
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

import { UserTypeormEntity } from '../../infrastructure/persistence/typeorm/user.typeorm-entity';
import { UserRepository } from '../../infrastructure/persistence/typeorm/user.repository';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([UserTypeormEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
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

    UserRepository,
    {
      provide: 'IUserRepository',
      useExisting: UserRepository,
    },
  ],
  controllers: [AuthController, UsersController],
  exports: [AuthService, JwtModule, RolesGuard],
})
export class AuthModule {}
