import { CreateUserDto } from 'src/dto/user.dto';
import { User } from 'src/schemas/user.schema';
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(
        private userService: UserService
    ) {
    }

    @Get('all')
    findAll(): Promise<User[]> {
        return this.userService.getUsers();
    }

    @Post('create')
    async createUser(
        @Body() user: CreateUserDto,
    ): Promise<User> {
        return await this.userService.createUser(user);
    }

    @Get(":id")
    async getuser(
        @Param('id') id,
    ): Promise<User> {
        return await this.userService.getUserById(id);
    }
}
