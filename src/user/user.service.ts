import { CreateUserDto, UpdateUserDto } from './../dto/user.dto';
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

    async createUser(user: CreateUserDto): Promise<User> {
        return this.userRepository.create(user);
    }

    async updateUser(userId: string, user: UpdateUserDto): Promise<User> {
        return this.userRepository.update(userId, user);
    }
}