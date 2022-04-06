import { User } from 'src/schemas/user.schema';
import { Controller, Get } from '@nestjs/common';
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
}
