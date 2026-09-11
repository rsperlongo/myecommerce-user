import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from '../../domain/entities/user.entity';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.usecase';
import { UpsertUserProfileUseCase } from '../../application/use-cases/upsert-user-profile.usecase';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpsertProfileDto } from './dtos/upsert-profile.dto';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
@ApiTags('Profile')
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly upsertUserProfileUseCase: UpsertUserProfileUseCase,
  ) {}

  @Get()
  async getProfile(@CurrentUser() currentUser: UserEntity) {
    const profile = await this.getUserProfileUseCase.execute(currentUser.email);

    return {
      message: 'User profile retrieved successfully',
      data: profile,
    };
  }

  @Put()
  async upsertProfile(
    @Body() profileDto: UpsertProfileDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const profile = await this.upsertUserProfileUseCase.execute(
      currentUser.email,
      profileDto,
    );

    return {
      message: 'User profile saved successfully',
      data: profile,
    };
  }
}
