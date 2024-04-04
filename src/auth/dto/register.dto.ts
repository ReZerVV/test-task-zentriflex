import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty()
    @MinLength(3, { message: 'Username must be greater than 3 characters' })
    @MaxLength(50, { message: 'Username must be less than 50 characters' })
    firstName: string;

    @ApiProperty()
    @MinLength(3, { message: 'Surname must be greater than 3 characters' })
    @MaxLength(50, { message: 'Surname must be less than 50 characters' })
    lastName: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty()
    @IsStrongPassword({ minLength: 8, minNumbers: 1 })
    password: string;
}
