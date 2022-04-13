import { UserService } from './../user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from 'src/dto/sign-up.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import ConfirmEmailDto from 'src/dto/confirm-email.dto';
import { AuthTokenStrategy } from './auth-token-strategy.interface';
import { ConfirmationTokenStrategy } from './confirmation-token-strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
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

    await newUser.save();
    let token = this.generateToken(newUser);

    this.mailService.sendUserConfirmation(newUser, token.accessToken);

    return token;
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

  async confirmEmail(confirmEmailDto: ConfirmEmailDto): Promise<User> {
    const email = await this.verifyToken(
      confirmEmailDto.token,
      new ConfirmationTokenStrategy(),
    );
    const user = await this.userModel.findOne({ email: email });

    if (user.verified) {
      throw new BadRequestException('USER_ALREADY_CONFIRMED_ERROR_MESSAGE');
    }

    (await user).verified = true;
    (await user).save();

    return user;
  }

  public async verifyToken(
    token: string,
    authTokenStrategy: AuthTokenStrategy,
  ): Promise<string> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: authTokenStrategy.getSecret(),
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('EXPIRED_TOKEN_ERROR');
      }
      throw new BadRequestException('BAD_TOKEN_ERROR');
    }
  }
}
