import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class QueryUsersDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'maria' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((role) => role.trim());
    }
    return value;
  })
  roles?: UserRole[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: ['email', 'createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['email', 'createdAt', 'updatedAt'])
  sortBy?: 'email' | 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
