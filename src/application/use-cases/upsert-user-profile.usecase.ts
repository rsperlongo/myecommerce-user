import { Inject, Injectable } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import type { UserProfileData } from '../../domain/repositories/user-profile.repository.interface';
import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class UpsertUserProfileUseCase {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
  ) {}

  execute(email: string, data: UserProfileData): Promise<UserProfileEntity> {
    return this.profileRepository.save(email, {
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      uf: data.uf.trim().toUpperCase(),
      married: data.married,
      churchMember: data.churchMember,
    });
  }
}
