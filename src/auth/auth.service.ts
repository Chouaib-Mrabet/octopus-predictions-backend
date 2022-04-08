import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from 'src/dto/sign-up.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  hello() {
    return 'hello from auth';
  }

  async signUp(signUpDto: SignUpDto): Promise<{ accessToken: string }> {
    let existingCredentials =
      (await this.userModel.findOne({
        userName: signUpDto.userName,
        email: signUpDto.email,
      })) != null;

    if (existingCredentials)
      throw new BadRequestException('Username or email already in use .');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    let newUser = new this.userModel({
      ...signUpDto,
      hashedPassword: hashedPassword,
    });

    //console.log(newUser);

    await newUser.save();
    return this.generateToken(newUser);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    let actualUser = await this.userModel.findOne({
      userName: loginDto.userName,
    });

    if (
      !actualUser ||
      !(await bcrypt.compare(loginDto.password, actualUser.hashedPassword))
    )
      throw new BadRequestException('wrong password .');

    return this.generateToken(actualUser);
  }

  generateToken(user: User): { accessToken: string } {
    const payload = { username: user.userName, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
