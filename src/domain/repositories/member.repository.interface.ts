import { MemberEntity } from '../entities/member.entity';

export type MemberData = Omit<
  MemberEntity,
  'id' | 'email' | 'createdAt' | 'updatedAt'
>;

export interface FindMembersOptions {
  page: number;
  limit: number;
  search?: string;
}

export interface IMemberRepository {
  save(email: string | null, data: MemberData): Promise<MemberEntity>;
  findById(id: string): Promise<MemberEntity | null>;
  findByEmail(email: string): Promise<MemberEntity | null>;
  findAll(
    options: FindMembersOptions,
  ): Promise<{ members: MemberEntity[]; total: number }>;
  update(
    id: string,
    email: string | null,
    data: MemberData,
  ): Promise<MemberEntity>;
  delete(id: string): Promise<boolean>;
}
