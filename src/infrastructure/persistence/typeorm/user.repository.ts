import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepository {
  save(user: UserEntity): Promise<UserEntity> {
    // TODO: implement TypeORM save logic
    return Promise.resolve(user);
  }

  findByEmail(): Promise<UserEntity | null> {
    // TODO: implement TypeORM find logic
    return Promise.resolve(null);
  }
}
