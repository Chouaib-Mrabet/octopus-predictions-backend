import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: "The username" })
    readonly userName: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: "the user email" })
    readonly email: string;

    @IsString()
    @ApiProperty({ description: "phone number" })
    readonly mobileNumber: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: "the user password" })
    readonly password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }