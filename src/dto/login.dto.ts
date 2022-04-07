import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The username' })
  userName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'password' })
  password: string;
}
