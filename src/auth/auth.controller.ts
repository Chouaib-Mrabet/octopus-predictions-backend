import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { SignUpDto } from 'src/dto/signUp.dto';
import { User } from 'src/schemas/user.schema';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.hello();
  }

  @Post('signup')
  async signup(
    @Body(ValidationPipe) signUpDto: SignUpDto,
  ): Promise<{ accessToken: string; user: User } | void> {
    return this.authService.signUp(signUpDto);
  }
}
