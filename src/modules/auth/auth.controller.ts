import { Controller, Post, Body, Res, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { validateLogin, validateRegister } from './auth.validator';
import { Response, Request } from 'express';
import { verifyRefreshToken, generateAccessToken } from '@/src/lib/jwt';
import { connectDB } from '@/src/lib/db';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000, // 15 mins (in ms)
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (in ms)
        });
    }

    @Post('login')
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login successful.' })
    async login(
        @Body() body: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        await connectDB();
        const validation = validateLogin(body);
        if (!validation.success) {
            throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
        }

        try {
            const { user, accessToken, refreshToken } = await this.authService.login(validation.data);
            this.setAuthCookies(res, accessToken, refreshToken);
            return { success: true, user };
        } catch (error: any) {
            throw new HttpException(error.message || 'Login failed', HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('register')
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Registration successful.' })
    async register(@Body() body: any) {
        await connectDB();
        const validation = validateRegister(body);
        if (!validation.success) {
            throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
        }

        try {
            const user = await this.authService.register(validation.data);
            return { success: true, user };
        } catch (error: any) {
            throw new HttpException(error.message || 'Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('refresh')
    @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        try {
            const refreshToken = req.cookies?.['refreshToken'];
            if (!refreshToken) {
                throw new HttpException('No refresh token provided', HttpStatus.UNAUTHORIZED);
            }

            const decoded = verifyRefreshToken(refreshToken) as any;
            const newAccessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                path: '/',
                maxAge: 15 * 60 * 1000,
            });

            return { success: true };
        } catch (error: any) {
            throw new HttpException('Refresh token expired or invalid, please login again', HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('logout')
    @ApiResponse({ status: 200, description: 'Logged out successfully.' })
    async logout(@Res({ passthrough: true }) res: Response) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 0,
        });
        res.cookie('accessToken', '', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 0,
        });

        return { success: true, message: 'Logged out' };
    }
}
