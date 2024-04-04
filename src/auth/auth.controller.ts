import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthDto } from './dto';
import { AccessTokenGuard } from './guards/at.guard';
import { Cookies } from './decorators/cookies.decorator';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Token } from '@prisma/client';

const REFRESH_TOKEN = 'refresh_token';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
    constructor(private readonly authSerivce: AuthService) {}

    @Post('login')
    @HttpCode(200)
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Account login successfully completed', type: AuthDto })
    @ApiResponse({ status: 400, description: 'Validation error' })
    async login(@Res({ passthrough: true }) res, @Body() dto: LoginDto) {
        const { refreshToken, ...result } = await this.authSerivce.login(dto);
        this.setRefreshTokenCookie(refreshToken, res);
        return result;
    }

    @Post('register')
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 200, description: 'User has been successfully created', type: AuthDto })
    @ApiResponse({ status: 400, description: 'Validation error' })
    async register(@Res({ passthrough: true }) res, @Body() dto: RegisterDto) {
        const { refreshToken, ...result } = await this.authSerivce.register(dto);
        this.setRefreshTokenCookie(refreshToken, res);
        return result;
    }

    @Post('refresh')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'User has been successfully created', type: AuthDto })
    @ApiResponse({ status: 401, description: 'Token expired, invalid token or other validation error' })
    async refresh(@Req() req, @Res({ passthrough: true }) res, @Cookies(REFRESH_TOKEN) token: string) {
        const { refreshToken, ...result } = await this.authSerivce.refresh(token);
        this.setRefreshTokenCookie(refreshToken, res);
        return result;
    }

    @ApiBearerAuth()
    @UseGuards(AccessTokenGuard)
    @Post('logout')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Logging out of the account was successfully completed' })
    @ApiResponse({ status: 401, description: 'User is not authorized' })
    async logout(@Req() req, @Res({ passthrough: true }) res) {
        await this.authSerivce.logout(req.user.id);
        res.clearCookie(REFRESH_TOKEN);
    }

    // Utils
    private async setRefreshTokenCookie(token: Token, res: Response) {
        res.cookie(REFRESH_TOKEN, token.token, {
            httpOnly: true,
            expires: token.exp,
            secure: true,
            path: '/',
        });
    }
}
