import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileEntity } from '../../../domain/entities/user-profile.entity';
import type {
  IUserProfileRepository,
  UserProfileData,
} from '../../../domain/repositories/user-profile.repository.interface';
import { UserProfileTypeormEntity } from './user-profile.typeorm-entity';

@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
  constructor(
    @InjectRepository(UserProfileTypeormEntity)
    private readonly repository: Repository<UserProfileTypeormEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserProfileEntity | null> {
    const profile = await this.repository.findOne({ where: { email } });
    return profile ? this.toDomain(profile) : null;
  }

  async save(email: string, data: UserProfileData): Promise<UserProfileEntity> {
    const profile = await this.repository.save(
      this.repository.create({ email, ...data }),
    );
    return this.toDomain(profile);
  }

  private toDomain(profile: UserProfileTypeormEntity): UserProfileEntity {
    return new UserProfileEntity({
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      uf: profile.uf,
      married: profile.married,
      churchMember: profile.churchMember,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }
}
