import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from 'src/dto/signUp.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  hello() {
    return 'hello from auth';
  }

  async signUp(
    signUpDto: SignUpDto,
  ): Promise<{ accessToken: string; user: User } | void> {
    let existingCredentials =
      (await this.userModel.findOne({
        userName: signUpDto.userName,
        email: signUpDto.email,
      })) != null;
    if (existingCredentials)
      throw new BadRequestException('username or email already in use .');
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);
    
    let user = new this.userModel({...signUpDto,hashedPassword:hashedPassword})
    console.log(user)
    user.save();
  }
}
