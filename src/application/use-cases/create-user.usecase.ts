import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../../domain/entities/user.entity';

export class CreateUserUseCase {
  execute(payload: { email: string; password: string }): UserEntity {
    return new UserEntity({
      id: uuidv4(),
      email: payload.email,
      password: payload.password,
      roles: ['user'],
    });
  }
}
