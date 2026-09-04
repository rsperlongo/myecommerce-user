import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserEntity } from '../../../domain/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): UserEntity {
    return new UserEntity({
      id: payload.sub,
      email: payload.email,
      password: '',
      roles: payload.roles ?? [UserRole.USER],
      isActive: payload.isActive ?? true,
    });
  }
}
