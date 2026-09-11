import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import type { IMemberRepository } from '../../domain/repositories/member.repository.interface';
import type { UserProfileData } from '../../domain/repositories/user-profile.repository.interface';
import type { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class UpsertUserProfileUseCase {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('IMemberRepository')
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(
    email: string,
    data: UserProfileData,
  ): Promise<UserProfileEntity> {
    if (!data.churchMember) {
      throw new BadRequestException('A system user must be a church member');
    }

    const member = await this.memberRepository.findByEmail(email);
    if (!member) {
      throw new BadRequestException(
        'Create the member record before completing the user profile',
      );
    }

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
