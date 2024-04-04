import { Controller, Delete, Get, Patch, UseGuards, Request, Body, HttpCode, NotFoundException } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/at.guard';
import { UsersService } from './users.service';
import { UserChangePasswordDto, UserDto, UserUpdateDto } from './dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('profile')
    @HttpCode(200)
    @ApiResponse({ status: 200, type: UserDto })
    @ApiResponse({ status: 401, description: 'User is not authorized' })
    async getUserProfile(@Request() req) {
        const { token, createdAt, updatedAt, ...result } = await this.usersService.findOneById(req.user.id);
        return result;
    }

    @Delete('profile')
    @HttpCode(204)
    @ApiResponse({ status: 204, description: 'The user account was successfully deleted' })
    @ApiResponse({ status: 401, description: 'User is not authorized' })
    async deleteUserProfile(@Request() req) {
        try {
            await this.usersService.delete(req.user.id);
        } catch (ex) {
            throw new NotFoundException('User is not found');
        }
    }

    @Patch('profile')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'User account data has been updated', type: UserDto })
    @ApiResponse({ status: 401, description: 'User is not authorized' })
    async updateUserProfile(@Request() req, @Body() dto: UserUpdateDto) {
        const { token, createdAt, updatedAt, ...result } = await this.usersService.update(req.user.id, dto);
        return result;
    }

    @Patch('profile/change-password')
    @HttpCode(200)
    @ApiBody({ type: UserChangePasswordDto })
    @ApiResponse({ status: 200, description: 'User has been updated', type: UserDto })
    @ApiResponse({ status: 401, description: 'User is not authorized' })
    async changePasswordUserProfiole(@Request() req, @Body() dto: UserChangePasswordDto) {
        const { token, createdAt, updatedAt, ...result } = await this.usersService.changePassword(req.user.id, dto);
        return result;
    }
}
