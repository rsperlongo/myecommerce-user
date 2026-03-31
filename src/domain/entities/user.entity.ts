export class UserEntity {
  id: string;
  email: string;
  password: string;
  roles: string[];

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
