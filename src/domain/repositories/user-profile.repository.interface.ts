import { UserProfileEntity } from '../entities/user-profile.entity';

export type UserProfileData = Omit<
  UserProfileEntity,
  'email' | 'createdAt' | 'updatedAt'
>;

export interface IUserProfileRepository {
  findByEmail(email: string): Promise<UserProfileEntity | null>;
  save(email: string, data: UserProfileData): Promise<UserProfileEntity>;
}
