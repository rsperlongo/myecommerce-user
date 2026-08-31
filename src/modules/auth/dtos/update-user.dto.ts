import {
  IsEmail,
  IsString,
  MinLength,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsArray()
  @IsOptional()
  roles?: UserRole[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
