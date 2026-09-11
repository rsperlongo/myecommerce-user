import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MemberEntity } from '../../domain/entities/member.entity';
import type { IMemberRepository } from '../../domain/repositories/member.repository.interface';

@Injectable()
export class GetMemberUseCase {
  constructor(
    @Inject('IMemberRepository')
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(id: string): Promise<MemberEntity> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async executeByEmail(email: string): Promise<MemberEntity> {
    const member = await this.memberRepository.findByEmail(email);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }
}
