import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';

export class CreateUserUseCase {
  execute(payload: { email: string; password: string }): UserEntity {
    return new UserEntity({
      id: uuidv4(),
      email: payload.email,
      password: payload.password,
      roles: [UserRole.USER],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
