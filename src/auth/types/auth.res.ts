import { Token } from '@prisma/client';
import { UserDto } from 'src/users/dto';

export interface AuthRes {
    user: UserDto;
    accessToken: string;
    refreshToken: Token;
}
