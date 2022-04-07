import { UpdateUserDto } from '../dto/update-user.dto';
import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async getUserById(userId: string): Promise<User> {
        return this.userRepository.findOne(userId);
    }

    async getUsers(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async updateUser(userId: string, user: UpdateUserDto): Promise<User> {
        return this.userRepository.update(userId, user);
    }
}