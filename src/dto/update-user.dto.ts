import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @IsString()
    @ApiProperty({ description: "The username" })
    readonly userName: string;

    @IsString()
    @IsEmail()
    @ApiProperty({ description: "the user email" })
    readonly email: string;

    @IsString()
    @ApiProperty({ description: "phone number" })
    readonly mobileNumber: string;

    @IsString()
    @ApiProperty({ description: "the user's old password" })
    readonly oldpassword: string;

    @IsString()
    @ApiProperty({ description: "the user new password" })
    readonly newpassword: string;
}
