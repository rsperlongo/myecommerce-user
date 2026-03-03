import { IsNotEmpty, IsEmail } from 'class-validator';

export class UsersDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  createdOn?: Date;
}
