import { Token, User } from '@prisma/client';

export type UserWithToken = User & {
    token: Token | null;
};
