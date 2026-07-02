import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '@/src/lib/jwt';

export interface DecodedToken {
    id: string;
    role: string;
}

export function getAuthUser(req: Request): DecodedToken | null {
    const refreshToken = req.cookies?.['refreshToken'];
    const accessToken = req.cookies?.['accessToken'];

    if (!refreshToken) {
        return null;
    }

    if (accessToken) {
        try {
            return verifyAccessToken(accessToken) as DecodedToken;
        } catch {
            // Fall through to refresh token
        }
    }

    try {
        return verifyRefreshToken(refreshToken) as DecodedToken;
    } catch {
        return null;
    }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const user = getAuthUser(request);
        
        if (!user) {
            throw new HttpException('Unauthorized: Access denied', HttpStatus.UNAUTHORIZED);
        }
        
        // Attach user object to request
        (request as any).user = user;
        return true;
    }
}
