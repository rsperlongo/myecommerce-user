import { UserEntity } from 'src/core/entities/users.entity';

export const toUserDto = (data: UserEntity) => {
  return {
    id: data.id,
    email: data.email,
    password: data.password,
  };
};
