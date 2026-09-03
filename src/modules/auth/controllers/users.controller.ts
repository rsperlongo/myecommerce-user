import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserEntity } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { QueryUsersDto } from '../dtos/query-users.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { AuthService } from '../services/auth.service';

// Use Cases
import { CreateUserWithRolesUseCase } from '../../../application/use-cases/create-user-with-roles.usecase';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.usecase';
import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.usecase';
import { InsufficientPermissionsException } from '../../../domain/exceptions/insufficient-permissions.exception';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly createUserUseCase: CreateUserWithRolesUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  /**
   * Criar novo usuário
   * Permissões: ADMIN, MANAGER, USER (com restrições por role)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  async createUser(
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
      const newUser = await this.createUserUseCase.execute({
        email: createUserDto.email,
        password: hashedPassword,
        roles,
        createdBy: currentUser,
      });

      return {
        message: 'User created successfully',
        data: UserResponseDto.fromEntity(newUser),
        createdBy: currentUser.email,
      };
    } catch (error) {
      if (error instanceof InsufficientPermissionsException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Listar usuários com paginação e filtros
   * Permissões: ADMIN (todos), MANAGER (USER, GUEST)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getUsers(
    @Query() query: QueryUsersDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    try {
      const result = this.getUsersUseCase.execute({
        requestedBy: currentUser,
        page: query.page,
        limit: query.limit,
        search: query.search,
        roles: query.roles,
        isActive: query.isActive,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      return {
        message: 'Users retrieved successfully',
        data: result.users.map((user) => UserResponseDto.fromEntity(user)),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      if (error instanceof InsufficientPermissionsException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * Obter usuário por ID
   * Permissões: ADMIN (todos), MANAGER (USER, GUEST), USER (GUEST + próprio), próprio usuário
   */
  @Get(':id')
  getUserById(@Param('id') id: string, @CurrentUser() currentUser: UserEntity) {
    try {
      const user = this.getUserByIdUseCase.execute({
        userId: id,
        requestedBy: currentUser,
      });

      return {
        message: 'User retrieved successfully',
        data: UserResponseDto.fromEntity(user),
      };
    } catch (error) {
      if (error instanceof InsufficientPermissionsException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Atualizar usuário
   * Permissões: ADMIN (todos), MANAGER (USER, GUEST), próprio usuário (sem roles)
   */
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    try {
      // Hash da nova senha se fornecida
      const hashedPassword = updateUserDto.password
        ? await this.authService.hashPassword(updateUserDto.password)
        : undefined;

      const updatedUser = this.updateUserUseCase.execute({
        userId: id,
        email: updateUserDto.email,
        password: hashedPassword,
        roles: updateUserDto.roles,
        isActive: updateUserDto.isActive,
        updatedBy: currentUser,
      });

      return {
        message: 'User updated successfully',
        data: UserResponseDto.fromEntity(updatedUser),
        updatedBy: currentUser.email,
      };
    } catch (error) {
      if (error instanceof InsufficientPermissionsException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Desativar usuário (soft delete)
   * Permissões: ADMIN apenas
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deactivateUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    try {
      const result = await this.deleteUserUseCase.execute({
        userId: id,
        deletedBy: currentUser,
        softDelete: true, // Sempre soft delete por padrão
      });

      return {
        message: result.message,
        data: UserResponseDto.fromEntity(result.deletedUser),
        deletedBy: currentUser.email,
      };
    } catch (error) {
      if (error instanceof InsufficientPermissionsException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Reativar usuário desativado
   * Permissões: ADMIN apenas
   */
  @Post(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  reactivateUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    try {
      const reactivatedUser = this.updateUserUseCase.execute({
        userId: id,
        isActive: true,
        updatedBy: currentUser,
      });

      return {
        message: 'User reactivated successfully',
        data: UserResponseDto.fromEntity(reactivatedUser),
        reactivatedBy: currentUser.email,
      };
    } catch (error) {
      if (error instanceof InsufficientPermissionsException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Obter estatísticas de usuários
   * Permissões: ADMIN, MANAGER
   */
  @Get('stats/summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getUserStats(@CurrentUser() currentUser: UserEntity) {
    // Mock implementation
    const requesterRole = currentUser.getHighestRole();

    let stats;
    if (requesterRole === UserRole.ADMIN) {
      stats = {
        total: 15,
        active: 12,
        inactive: 3,
        byRole: {
          admin: 2,
          manager: 3,
          user: 8,
          guest: 2,
        },
        recentRegistrations: 5, // Últimos 7 dias
      };
    } else {
      // MANAGER só vê estatísticas de USER e GUEST
      stats = {
        total: 10,
        active: 8,
        inactive: 2,
        byRole: {
          user: 8,
          guest: 2,
        },
        recentRegistrations: 3,
      };
    }

    return {
      message: 'User statistics retrieved successfully',
      data: stats,
    };
  }
}
