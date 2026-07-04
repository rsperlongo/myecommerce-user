export class UserEntity {
  id!: string;
  email!: string;
  password!: string;
  roles!: string[];

  constructor(partial?: Partial<UserEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
