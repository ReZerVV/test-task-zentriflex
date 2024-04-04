import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    password: string;
}
