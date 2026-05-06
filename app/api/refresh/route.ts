import { DecodedToken } from "@/app/lib/middleware/auth";
import { generateAccessToken, verifyRefreshToken } from "@/app/lib/utils";
import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://vikasbhattclasses.com",
];

function getCorsHeaders(request: NextRequest) {
    const origin = request.headers.get("origin") ?? "";
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(request) });
}

export async function POST(request: NextRequest) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "No refresh token" },
                { status: 401, headers: corsHeaders }
            );
        }

        const decoded = verifyRefreshToken(refreshToken) as DecodedToken;
        const newAccessToken = generateAccessToken({ id: decoded.id, role: decoded.role });

        const response = NextResponse.json(
            { success: true },
            { headers: corsHeaders }
        );

        const isProduction = process.env.NODE_ENV === "production";

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: isProduction,            
            sameSite: isProduction ? "none" : "lax",     
            path: "/",
            maxAge: 15 * 60,
        });

        return response;

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Refresh token expired, login again" },
            { status: 401, headers: corsHeaders }
        );
    }
}