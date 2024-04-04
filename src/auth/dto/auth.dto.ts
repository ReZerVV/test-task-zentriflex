import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto';

export class AuthDto {
    @ApiProperty()
    user: UserDto;

    @ApiProperty()
    accessToken: string;
}
