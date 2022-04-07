import { User } from 'src/schemas/user.schema';
import { Controller, Get, Param } from '@nestjs/common';
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

    @Get(":id")
    async getuser(
        @Param('id') id,
    ): Promise<User> {
        return await this.userService.getUserById(id);
    }
}
