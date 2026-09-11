import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateMemberUseCase } from '../../application/use-cases/create-member.usecase';
import { DeleteMemberUseCase } from '../../application/use-cases/delete-member.usecase';
import { GetMemberUseCase } from '../../application/use-cases/get-member.usecase';
import { ListMembersUseCase } from '../../application/use-cases/list-members.usecase';
import { UpdateMemberUseCase } from '../../application/use-cases/update-member.usecase';
import { MemberRepository } from '../../infrastructure/persistence/typeorm/member.repository';
import { MemberTypeormEntity } from '../../infrastructure/persistence/typeorm/member.typeorm-entity';
import { AuthModule } from '../auth/auth.module';
import { MembersController } from './members.controller';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([MemberTypeormEntity])],
  controllers: [MembersController],
  providers: [
    CreateMemberUseCase,
    DeleteMemberUseCase,
    GetMemberUseCase,
    ListMembersUseCase,
    UpdateMemberUseCase,
    MemberRepository,
    {
      provide: 'IMemberRepository',
      useExisting: MemberRepository,
    },
  ],
  exports: ['IMemberRepository'],
})
export class MembersModule {}
