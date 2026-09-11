import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.usecase';
import { UpsertUserProfileUseCase } from '../../application/use-cases/upsert-user-profile.usecase';
import { UserProfileRepository } from '../../infrastructure/persistence/typeorm/user-profile.repository';
import { UserProfileTypeormEntity } from '../../infrastructure/persistence/typeorm/user-profile.typeorm-entity';
import { ProfileController } from './profile.controller';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    MembersModule,
    TypeOrmModule.forFeature([UserProfileTypeormEntity]),
  ],
  controllers: [ProfileController],
  providers: [
    GetUserProfileUseCase,
    UpsertUserProfileUseCase,
    UserProfileRepository,
    {
      provide: 'IUserProfileRepository',
      useExisting: UserProfileRepository,
    },
  ],
})
export class ProfileModule {}
