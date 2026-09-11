import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IMemberRepository } from '../../domain/repositories/member.repository.interface';

@Injectable()
export class DeleteMemberUseCase {
  constructor(
    @Inject('IMemberRepository')
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.memberRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Member not found');
    }
  }
}
