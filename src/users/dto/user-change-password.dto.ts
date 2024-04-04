import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export class UserChangePasswordDto {
    @ApiProperty()
    password: string;

    @ApiProperty()
    @IsStrongPassword({ minLength: 8, minNumbers: 1 })
    newPassword: string;
}
