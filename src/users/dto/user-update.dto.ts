import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';

export class UserUpdateDto {
    @ApiProperty()
    @IsOptional()
    @MinLength(3, { message: 'Username must be greater than 3 characters' })
    @MaxLength(50, { message: 'Username must be less than 50 characters' })
    firstName: string | null = null;

    @ApiProperty()
    @IsOptional()
    @MinLength(3, { message: 'Surname must be greater than 3 characters' })
    @MaxLength(50, { message: 'Surname must be less than 50 characters' })
    lastName: string | null = null;

    @ApiProperty()
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber: string | null = null;
}
