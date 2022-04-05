import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from 'src/repositories/user.repository';
import { User } from 'src/schemas/user.schema';
import { uuid } from 'uuidv4';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async getUserById(userId: string): Promise<User> {
        return this.userRepository.findOne({ userId })
    }

    async getUsers(): Promise<User[]> {
        return this.userRepository.find({});
    }

    //  async createUser(email: string, age: number): Promise<User> {
    //      return this.userRepository.create({
    //          userId: uuid(),
    //          // ...
    //      })
    //  }

    // async updateUser(userId: string, userUpdates: UpdateUserDto): Promise<User> {
    //     return this.userRepository.findOneAndUpdate({ userId }, userUpdates);
    // }
}