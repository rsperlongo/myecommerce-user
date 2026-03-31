import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepository {
  async save(user: UserEntity): Promise<UserEntity> {
    // TODO: implement TypeORM save logic
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    // TODO: implement TypeORM find logic
    return null;
  }
}
