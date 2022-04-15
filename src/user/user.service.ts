import { AuthService } from './../auth/auth.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { User, UserDocument } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private authService: AuthService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async updateUser(
    id: string,
    userDto: UpdateUserDto,
  ): Promise<{ accessToken: string }> {
    let userFromDb = await this.userModel.findOne({ _id: id });

    if (!userFromDb)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    if (userDto.userName) {
      if (userFromDb.userName != userDto.userName) {
        let user = await this.userModel.findOne({ userName: userDto.userName });
        if (user) throw new BadRequestException('This username is used');
        else userFromDb.userName = userDto.userName;
      }
    }

    if (userDto.email) {
      if (userFromDb.email != userDto.email) {
        let user = await this.userModel.findOne({ email: userDto.email });
        if (user) throw new BadRequestException('This email is used');
        else userFromDb.email = userDto.email;
      }
    }

    if (userDto.mobileNumber) {
      if (userFromDb.mobileNumber != userDto.mobileNumber) {
        let user = await this.userModel.findOne({
          mobileNumber: userDto.mobileNumber,
        });
        if (user) throw new BadRequestException('This mobileNumber is used');
        else userFromDb.mobileNumber = userDto.mobileNumber;
      }
    }

    if (userDto.oldpassword && userDto.newpassword) {
      if (
        await bcrypt.compare(userDto.oldpassword, userFromDb.hashedPassword)
      ) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(userDto.newpassword, salt);
        userFromDb.hashedPassword = hashedPassword;
      } else {
        throw new BadRequestException('wrong password .');
      }
    }

    await userFromDb.save();

    return await this.authService.generateToken(userFromDb);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email });
  }

  async markEmailAsConfirmed(userEmail: string): Promise<User> {
    let user = this.userModel.findOne({ email: userEmail });

    (await user).verified = true;
    (await user).save();

    return user;
  }
}
