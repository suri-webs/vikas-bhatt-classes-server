import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from "@/app/lib/utils";

const allowedOrigins = [
    "http://localhost:3000",
    "https://vikasbhattclasses.com",
];

function getCorsHeaders(request: NextRequest) {
    const origin = request.headers.get("origin") || "";
    const isAllowed = allowedOrigins.includes(origin);
    return {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(request) });
}

export interface DecodedToken {
    id: string;
    role: string;
}

export type AuthResult =
    | { success: false; response: Response }
    | { success: true; decoded: DecodedToken };

export function withAuth(request: NextRequest): AuthResult {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!refreshToken) {
        return {
            success: false,
            response: Response.json(
                { success: false, message: "Unauthorized: No token provided" },
                { status: 401, headers: getCorsHeaders(request) }
            ),
        };
    }

    //  Case 1: Access token exists — verify it directly
    if (accessToken) {
        try {
            const decoded = verifyAccessToken(accessToken) as DecodedToken;
            return { success: true, decoded };
        } catch (error: any) {
            const isJwtError =
                error.name === "JsonWebTokenError" ||
                error.name === "TokenExpiredError";

            // Access token invalid/expired — fall through to refresh token below
            if (!isJwtError) {
                return {
                    success: false,
                    response: Response.json(
                        { success: false, message: "Unauthorized: Token verification failed" },
                        { status: 401, headers: getCorsHeaders(request) }
                    ),
                };
            }
        }
    }

    // Case 2: No access token (or it was expired) — try refresh token
    try {
        const decoded = verifyRefreshToken(refreshToken) as DecodedToken;

        // Optionally: attach new access token to response in your route handler
        // using the returned decoded payload to generateAccessToken(...)

        return { success: true, decoded };
    } catch (error: any) {
        const isJwtError =
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError";

        return {
            success: false,
            response: Response.json(
                {
                    success: false,
                    message: isJwtError
                        ? "Unauthorized: Invalid or expired token"
                        : "Unauthorized: Token verification failed",
                },
                { status: 401, headers: getCorsHeaders(request) }
            ),
        };
    }
}