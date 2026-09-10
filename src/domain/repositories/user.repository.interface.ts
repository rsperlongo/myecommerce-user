import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

export interface FindUsersOptions {
  page: number;
  limit: number;
  search?: string;
  roles?: UserRole[];
  isActive?: boolean;
  sortBy?: 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Partial<Record<UserRole, number>>;
  recentRegistrations: number;
}

export interface IUserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(
    options: FindUsersOptions,
  ): Promise<{ users: UserEntity[]; total: number }>;
  getStats(roles: UserRole[]): Promise<UserStats>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null>;
  softDelete(id: string): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
  countActiveAdmins(): Promise<number>;
}
