import { IsOptional, IsString, IsNumber, Min, Max, IsArray, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class QueryUsersDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(role => role.trim());
    }
    return value;
  })
  roles?: UserRole[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: 'email' | 'createdAt' | 'updatedAt' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}