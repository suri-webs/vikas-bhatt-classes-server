import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { validateCreateUser, validateUpdateUser } from './user.validator';
import { Request } from 'express';
import { JwtAuthGuard } from '@/src/lib/middleware/auth';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { connectDB } from '@/src/lib/db';
import { UserRole } from '@/src/lib/enums';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiQuery({ name: 'rollNumber', required: false })
    @ApiResponse({ status: 200, description: 'List of users or specific user.' })
    async getUsers(
        @Req() req: Request,
        @Query('rollNumber') rollNumber?: string,
    ) {
        const decoded = (req as any).user;
        await connectDB();

        try {
            if (decoded.role === UserRole.ADMIN) {
                const result = await this.userService.getUsers(rollNumber);
                if (Array.isArray(result)) {
                    return { success: true, users: result };
                } else {
                    return { success: true, user: result };
                }
            }

            if (decoded.role === UserRole.STUDENT && rollNumber) {
                const user = await this.userService.getUsers(rollNumber);
                return { success: true, user };
            }

            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
        } catch (error: any) {
            const status = error.message.includes('No user found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to fetch users', status);
        }
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiResponse({ status: 200, description: 'User details.' })
    async getUserById(@Req() req: Request, @Param('id') id: string) {
        const decoded = (req as any).user;
        await connectDB();

        try {
            const user = await this.userService.getUserByIdOrRollNumber(id);

            if (decoded.role === UserRole.STUDENT && decoded.id !== user._id.toString()) {
                throw new HttpException('Forbidden: You can only view your own profile', HttpStatus.FORBIDDEN);
            }

            return { success: true, user };
        } catch (error: any) {
            const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new HttpException(error.message || 'Failed to fetch user', status);
        }
    }

    @Post()
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User created successfully.' })
    async createUser(@Body() body: any) {
        await connectDB();
        const validation = validateCreateUser(body);
        if (!validation.success) {
            throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
        }

        try {
            const user = await this.userService.createUser(validation.data);
            return { success: true, user };
        } catch (error: any) {
            if (error.code === 11000) {
                throw new HttpException('Duplicate key error', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(error.message || 'Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User profile updated successfully.' })
    async updateUser(@Req() req: Request, @Body() body: any) {
        const decoded = (req as any).user;
        await connectDB();

        const validation = validateUpdateUser(body);
        if (!validation.success) {
            throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
        }

        try {
            const updatedUser = await this.userService.updateUser(decoded, validation.data);
            return { success: true, user: updatedUser };
        } catch (error: any) {
            const status = error.message.includes('Forbidden') ? HttpStatus.FORBIDDEN : (error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR);
            throw new HttpException(error.message || 'Failed to update user', status);
        }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User profile updated successfully by ID.' })
    async updateUserById(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        const decoded = (req as any).user;
        await connectDB();

        const validation = validateUpdateUser({ ...body, id });
        if (!validation.success) {
            throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
        }

        try {
            const updatedUser = await this.userService.updateUser(decoded, validation.data);
            return { success: true, user: updatedUser };
        } catch (error: any) {
            const status = error.message.includes('Forbidden') ? HttpStatus.FORBIDDEN : (error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR);
            throw new HttpException(error.message || 'Failed to update user', status);
        }
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiResponse({ status: 200, description: 'User deleted.' })
    async deleteUser(@Req() req: Request, @Body() body: { rollNumber: string }) {
        const decoded = (req as any).user;
        await connectDB();

        const { rollNumber } = body;
        if (!rollNumber) {
            throw new HttpException('Roll number required', HttpStatus.BAD_REQUEST);
        }

        try {
            await this.userService.deleteUser(decoded, rollNumber);
            return { success: true, message: 'User deleted' };
        } catch (error: any) {
            const status = error.message.includes('Unauthorized') ? HttpStatus.UNAUTHORIZED : (error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR);
            throw new HttpException(error.message || 'Failed to delete user', status);
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT_AUTH')
    @ApiResponse({ status: 200, description: 'User deleted by ID.' })
    async deleteUserById(@Req() req: Request, @Param('id') id: string) {
        const decoded = (req as any).user;
        await connectDB();

        try {
            await this.userService.deleteUser(decoded, id);
            return { success: true, message: 'User deleted' };
        } catch (error: any) {
            const status = error.message.includes('Unauthorized') ? HttpStatus.UNAUTHORIZED : (error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR);
            throw new HttpException(error.message || 'Failed to delete user', status);
        }
    }
}
