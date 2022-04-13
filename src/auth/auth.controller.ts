import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import ConfirmEmailDto from 'src/dto/confirm-email.dto';
import { LoginDto } from 'src/dto/login.dto';
import { SignUpDto } from 'src/dto/sign-up.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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
  ): Promise<{ accessToken: string }> {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto);
  }

  @Post('confirm')
  async confirm(@Body() confirmEmailDto: ConfirmEmailDto) {
    console.log('confirm');
    return this.authService.confirmEmail(confirmEmailDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('whoami')
  async getProfile(@Request() req) {
    return req.user;
  }
}
