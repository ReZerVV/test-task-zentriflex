import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, Token, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserChangePasswordDto } from './dto/user-change-password.dto';
import { UserUpdateDto } from './dto';
import { UserWithToken } from './types/user-with-token';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async findOneById(id: number): Promise<UserWithToken | undefined> {
        return this.prismaService.user.findUnique({
            where: { id },
            include: { token: true },
        });
    }

    async findOneByEmail(email: string): Promise<UserWithToken | undefined> {
        return this.prismaService.user.findUnique({
            where: { email },
            include: { token: true },
        });
    }

    async findOneByPhoneNumber(phoneNumber: string): Promise<UserWithToken | undefined> {
        return this.prismaService.user.findUnique({
            where: { phoneNumber },
            include: { token: true },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<UserWithToken> {
        return this.prismaService.user.create({ data, include: { token: true } });
    }

    async update(userId: number, dto: UserUpdateDto): Promise<UserWithToken> {
        let updateUser;
        if (dto.firstName) updateUser = { firstName: dto.firstName, ...updateUser };
        if (dto.lastName) updateUser = { lastName: dto.lastName, ...updateUser };
        if (dto.phoneNumber) {
            if (await this.findOneByPhoneNumber(dto.phoneNumber))
                throw new BadRequestException(
                    `This phone ${dto.phoneNumber} number is already occupied by another user`,
                );
            updateUser = { phoneNumber: dto.phoneNumber, ...updateUser };
        }

        const user = await this.prismaService.user.update({
            where: { id: userId },
            data: { ...updateUser },
            include: { token: true },
        });

        return user;
    }

    async delete(userId: number): Promise<User> {
        return this.prismaService.user.delete({ where: { id: userId } });
    }

    async changePassword(userId: number, dto: UserChangePasswordDto): Promise<UserWithToken> {
        let user: UserWithToken = await this.findOneById(userId);

        if (!(await argon2.verify(user.passwordHash, dto.password))) throw new BadRequestException('Wrong password');

        user = await this.prismaService.user.update({
            where: { id: userId },
            data: { passwordHash: await argon2.hash(dto.newPassword) },
            include: { token: true },
        });

        return user;
    }
}
