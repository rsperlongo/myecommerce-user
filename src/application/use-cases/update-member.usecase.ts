import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MemberEntity } from '../../domain/entities/member.entity';
import type {
  IMemberRepository,
  MemberData,
} from '../../domain/repositories/member.repository.interface';

@Injectable()
export class UpdateMemberUseCase {
  constructor(
    @Inject('IMemberRepository')
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(
    id: string,
    email: string | null,
    data: MemberData,
  ): Promise<MemberEntity> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return this.memberRepository.update(id, email, data);
  }
}
