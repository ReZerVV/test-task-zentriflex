import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

const jwtModuleOptions = (configService: ConfigService): JwtModuleOptions => ({
    secret: configService.get<string>('JWT_SECRET_KEY'),
    signOptions: {
        expiresIn: `${configService.get<string>('JWT_ACCESS_TOKEN_EXP')}m`,
        audience: configService.get<string>('JWT_TOKEN_AUDIENCE'),
        issuer: configService.get<string>('JWT_TOKEN_ISSUER'),
    },
});

export const options = (): JwtModuleAsyncOptions => ({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => jwtModuleOptions(configService),
    inject: [ConfigService],
});
