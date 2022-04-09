import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Userd } from 'src/decorators/userd.decorator';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User } from 'src/schemas/user.schema';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Userd() userd,
  ): Promise<{ accessToken: string }> {
    return await this.userService.updateUser(userd._id, updateUserDto);
  }
}
