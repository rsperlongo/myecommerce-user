import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateToken(user: UserEntity): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    };
    return this.jwtService.sign(payload);
  }

  async authenticate(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (
      !user ||
      !user.isActive ||
      !(await this.comparePasswords(password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
