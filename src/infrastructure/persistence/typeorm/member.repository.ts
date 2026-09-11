import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from '../../../domain/entities/member.entity';
import type {
  FindMembersOptions,
  IMemberRepository,
  MemberData,
} from '../../../domain/repositories/member.repository.interface';
import { MemberTypeormEntity } from './member.typeorm-entity';

@Injectable()
export class MemberRepository implements IMemberRepository {
  constructor(
    @InjectRepository(MemberTypeormEntity)
    private readonly repository: Repository<MemberTypeormEntity>,
  ) {}

  async save(email: string | null, data: MemberData): Promise<MemberEntity> {
    const member = await this.repository.save(
      this.repository.create({ email, ...data }),
    );
    return this.toDomain(member);
  }

  async findById(id: string): Promise<MemberEntity | null> {
    const member = await this.repository.findOne({ where: { id } });
    return member ? this.toDomain(member) : null;
  }

  async findByEmail(email: string): Promise<MemberEntity | null> {
    const member = await this.repository.findOne({ where: { email } });
    return member ? this.toDomain(member) : null;
  }

  async findAll(
    options: FindMembersOptions,
  ): Promise<{ members: MemberEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('member');
    if (options.search) {
      query.where(
        '(LOWER(member.name) LIKE LOWER(:search) OR LOWER(member.email) LIKE LOWER(:search))',
        { search: `%${options.search}%` },
      );
    }

    const [members, total] = await query
      .orderBy('member.name', 'ASC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return { members: members.map((member) => this.toDomain(member)), total };
  }

  async update(
    id: string,
    email: string | null,
    data: MemberData,
  ): Promise<MemberEntity> {
    const member = await this.repository.findOne({ where: { id } });
    if (!member) {
      throw new Error('Member not found');
    }
    Object.assign(member, { email, ...data });
    return this.toDomain(await this.repository.save(member));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected === 1;
  }

  private toDomain(member: MemberTypeormEntity): MemberEntity {
    return new MemberEntity({
      id: member.id,
      email: member.email,
      name: member.name,
      phone: member.phone,
      address: member.address,
      city: member.city,
      uf: member.uf,
      married: member.married,
      churchMember: member.churchMember,
      memberSince: member.memberSince,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    });
  }
}
