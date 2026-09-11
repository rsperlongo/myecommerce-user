import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MemberEntity } from '../../domain/entities/member.entity';
import type {
  IMemberRepository,
  MemberData,
} from '../../domain/repositories/member.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class CreateMemberUseCase {
  constructor(
    @Inject('IMemberRepository')
    private readonly memberRepository: IMemberRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string | null, data: MemberData): Promise<MemberEntity> {
    if (email) {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new BadRequestException(
          'Member email must belong to an existing user',
        );
      }

      const existingMember = await this.memberRepository.findByEmail(email);
      if (existingMember) {
        throw new BadRequestException(
          'A member is already linked to this email',
        );
      }
    }

    return this.memberRepository.save(email, data);
  }
}
