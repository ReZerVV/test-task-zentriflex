import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    imports: [PrismaModule],
    providers: [UsersService, PrismaService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
