import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRes } from './types';
import { Token, User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly configSerivce: ConfigService,
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async register(dto: RegisterDto): Promise<AuthRes> {
        if (await this.usersService.findOneByEmail(dto.email))
            throw new BadRequestException('User with this email already exists');

        if (await this.usersService.findOneByPhoneNumber(dto.phoneNumber))
            throw new BadRequestException('User with this phone number already exists');

        const user = await this.usersService.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            passwordHash: await argon2.hash(dto.password),
            phoneNumber: dto.phoneNumber,
        });

        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.createToken(
            user.id,
            await this.generateRefreshToken(),
            this.configSerivce.get<number>('JWT_REFRESH_TOKEN_EXP'),
        );

        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
            },
            accessToken,
            refreshToken,
        };
    }

    async login(dto: LoginDto): Promise<AuthRes> {
        const user = await this.usersService.findOneByEmail(dto.email);

        if (!user) throw new BadRequestException('There is no user with that email address');
        if (!(await argon2.verify(user.passwordHash, dto.password))) throw new BadRequestException('Wrong password');

        let refreshToken;
        if (user.token) {
            refreshToken = await this.updateToken(
                user.id,
                await this.generateRefreshToken(),
                this.configSerivce.get<number>('JWT_REFRESH_TOKEN_EXP'),
            );
        } else {
            refreshToken = await this.createToken(
                user.id,
                await this.generateRefreshToken(),
                this.configSerivce.get<number>('JWT_REFRESH_TOKEN_EXP'),
            );
        }

        const accessToken = await this.generateAccessToken(user);

        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
            },
            accessToken,
            refreshToken,
        };
    }

    async logout(userId: number): Promise<void> {
        await this.removeToken(userId);
    }

    async refresh(tokenValue: string): Promise<AuthRes> {
        if (!tokenValue) throw new UnauthorizedException('User is not authorized');

        const token = await this.prismaService.token.findFirst({
            where: { token: tokenValue },
            include: { user: true },
        });
        const user = token.user;

        if (!token) throw new UnauthorizedException('User is not authorized');
        if (token.token != tokenValue) throw new UnauthorizedException('Invalid token');
        if (token.exp <= new Date(Date.now())) throw new UnauthorizedException('Token expired');

        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.updateToken(
            user.id,
            await this.generateRefreshToken(),
            this.configSerivce.get<number>('JWT_REFRESH_TOKEN_EXP'),
        );

        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
            },
            accessToken,
            refreshToken,
        };
    }

    private async generateAccessToken(user: User): Promise<string> {
        return await this.jwtService.signAsync({ sub: user.id, email: user.email });
    }

    private async generateRefreshToken(size: number = 50): Promise<string> {
        const buffer = crypto.randomBytes(size * 2);
        return await argon2.hash(buffer.toString('hex'));
    }

    private async createToken(userId: number, token: string, lifeTime: number): Promise<Token> {
        const exp = new Date(Date.now());
        exp.setMinutes(exp.getMinutes() + lifeTime);
        return await this.prismaService.token.create({
            data: { userId, token, exp },
        });
    }

    private async updateToken(userId: number, token: string, lifeTime: number): Promise<Token> {
        const exp = new Date(Date.now());
        exp.setMinutes(exp.getMinutes() + lifeTime);
        return await this.prismaService.token.update({
            where: { userId },
            data: { token, exp },
        });
    }

    private async removeToken(userId: number): Promise<void> {
        await this.prismaService.token.delete({ where: { userId } });
    }
}
