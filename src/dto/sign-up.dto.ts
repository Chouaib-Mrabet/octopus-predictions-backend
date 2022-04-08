import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The username' })
  readonly userName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'the user email' })
  readonly email: string;

  @IsString()
  @ApiProperty({ description: 'phone number' })
  readonly mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'the user password' })
  readonly password: string;
}
