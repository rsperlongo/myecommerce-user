import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserWithRolesUseCase } from '../../application/use-cases/create-user-with-roles.usecase';
import { InsufficientPermissionsException } from '../../domain/exceptions/insufficient-permissions.exception';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly createUserWithRolesUseCase: CreateUserWithRolesUseCase,
  ) {}

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  async register(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    try {
      // Hash da senha
      const hashedPassword = await this.authService.hashPassword(
        createUserDto.password,
      );

      // Definir roles padrão se não especificado
      const roles = createUserDto.roles || [UserRole.USER];

      // Criar usuário usando o use case que valida permissões
      const newUser = await this.createUserWithRolesUseCase.execute({
        email: createUserDto.email,
        password: hashedPassword,
        roles,
        createdBy: currentUser,
      });

      return {
        message: 'User registered successfully',
        id: newUser.id,
        email: newUser.email,
        roles: newUser.roles,
        createdBy: currentUser.email,
      };
    } catch (error) {
      if (error instanceof InsufficientPermissionsException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('register/public')
  async registerPublic(@Body() createUserDto: CreateUserDto) {
    // Registro público só permite criar usuários com role USER
    const hashedPassword = await this.authService.hashPassword(
      createUserDto.password,
    );

    // Para registro público, criar um usuário "sistema" temporário para validação
    const systemUser = new UserEntity({
      id: 'system',
      email: 'system',
      password: '',
      roles: [UserRole.ADMIN], // Sistema tem permissão total
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      const newUser = await this.createUserWithRolesUseCase.execute({
        email: createUserDto.email,
        password: hashedPassword,
        roles: [UserRole.USER], // Apenas role USER para registro público
        createdBy: systemUser,
      });

      return {
        message: 'User registered successfully',
        id: newUser.id,
        email: newUser.email,
        roles: newUser.roles,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  @Post('login')
  login(@Body() credentials: LoginDto) {
    // TODO: Implementar validação real de login
    // Por enquanto, simulando um usuário válido
    const mockUser = new UserEntity({
      id: uuidv4(),
      email: credentials.email,
      password: '',
      roles: [UserRole.USER],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = this.authService.generateToken(mockUser);
    return {
      access_token: token,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        roles: mockUser.roles,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@CurrentUser() user: Record<string, unknown>) {
    return {
      message: 'User profile',
      user: {
        id: user.userId,
        email: user.email,
        roles: user.roles,
        isActive: user.isActive,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get('available-roles')
  @ApiBearerAuth()
  getAvailableRoles(@CurrentUser() user: Record<string, unknown>) {
    const currentUserRole = (user.roles as UserRole[])[0]; // Assumindo que o primeiro role é o principal
    const availableRoles =
      this.createUserWithRolesUseCase.getAvailableRolesForUser(currentUserRole);

    return {
      availableRoles,
      currentUserRole,
    };
  }
}
