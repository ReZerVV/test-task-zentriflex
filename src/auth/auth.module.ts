import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AccessTokenStrategy } from './strategies/at.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { options } from './config';

@Module({
    imports: [UsersModule, PassportModule, ConfigModule, PrismaModule, JwtModule.registerAsync(options())],
    providers: [AuthService, AccessTokenStrategy, PrismaService],
    controllers: [AuthController],
})
export class AuthModule {}
