import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import type {
  FindUsersOptions,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { UserTypeormEntity } from './user.typeorm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeormEntity)
    private readonly repository: Repository<UserTypeormEntity>,
  ) {}

  async save(user: UserEntity): Promise<UserEntity> {
    const persisted = await this.repository.save(this.toPersistence(user));
    return this.toDomain(persisted);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.repository.findOne({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.repository.findOne({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findAll(
    options: FindUsersOptions,
  ): Promise<{ users: UserEntity[]; total: number }> {
    const query = this.repository.createQueryBuilder('user');

    if (options.search) {
      query.andWhere('LOWER(user.email) LIKE LOWER(:search)', {
        search: `%${options.search}%`,
      });
    }
    if (options.roles?.length) {
      query.andWhere('user.roles::text[] && ARRAY[:...roles]', {
        roles: options.roles,
      });
    }
    if (options.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    const sortBy = options.sortBy ?? 'createdAt';
    const sortOrder = options.sortOrder ?? 'DESC';
    const [users, total] = await query
      .orderBy(`user.${sortBy}`, sortOrder)
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return { users: users.map((user) => this.toDomain(user)), total };
  }

  async update(
    id: string,
    data: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    Object.assign(user, data);
    return this.toDomain(await this.repository.save(user));
  }

  async softDelete(id: string): Promise<UserEntity | null> {
    return this.update(id, { isActive: false });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected === 1;
  }

  countActiveAdmins(): Promise<number> {
    return this.repository
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role: UserRole.ADMIN })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getCount();
  }

  private toPersistence(user: UserEntity): UserTypeormEntity {
    return this.repository.create({
      id: user.id,
      email: user.email,
      password: user.password,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  private toDomain(user: UserTypeormEntity): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      password: user.password,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
