import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpsertProfileDto {
  @ApiProperty({ example: 'Maria da Silva' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: '(11) 99999-9999' })
  @IsString()
  @Matches(/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/, {
    message: 'phone must be a valid Brazilian phone number with area code',
  })
  phone!: string;

  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string;

  @ApiProperty({ example: 'Sao Paulo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: 'SP', minLength: 2, maxLength: 2 })
  @IsString()
  @Matches(/^[A-Za-z]{2}$/)
  uf!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  married!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  churchMember!: boolean;
}
