import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
  ) {}

  async execute(email: string): Promise<UserProfileEntity> {
    const profile = await this.profileRepository.findByEmail(email);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }
    return profile;
  }
}
