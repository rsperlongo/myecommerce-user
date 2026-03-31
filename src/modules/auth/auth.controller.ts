import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const userId = uuidv4();
    await this.authService.hashPassword(createUserDto.password);
    return {
      message: 'User registered successfully',
      id: userId,
      email: createUserDto.email,
    };
  }

  @Post('login')
  login(@Body() credentials: { email: string; password: string }) {
    const token = this.authService.generateToken({
      sub: uuidv4(),
      email: credentials.email,
    });
    return { access_token: token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile() {
    return { message: 'User profile' };
  }
}
