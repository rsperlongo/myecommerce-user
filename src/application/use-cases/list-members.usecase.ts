import { Inject, Injectable } from '@nestjs/common';
import type { IMemberRepository } from '../../domain/repositories/member.repository.interface';

@Injectable()
export class ListMembersUseCase {
  constructor(
    @Inject('IMemberRepository')
    private readonly memberRepository: IMemberRepository,
  ) {}

  execute(page: number, limit: number, search?: string) {
    return this.memberRepository.findAll({ page, limit, search });
  }
}
