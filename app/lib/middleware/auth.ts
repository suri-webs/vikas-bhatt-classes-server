import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "@/app/lib/utils";

export interface DecodedToken {
    id: string;
    role: string;
}

export type AuthResult =
    | { success: false; response: NextResponse }
    | { success: true; decoded: DecodedToken; response?: NextResponse };

export function getCorsHeaders(request: NextRequest) {
    const origin = request.headers.get("origin") ?? "";
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}

export function withAuth(request: NextRequest): AuthResult {
    const corsHeaders = getCorsHeaders(request);
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) {
        return {
            success: false,
            response: NextResponse.json(
                { success: false, message: "Unauthorized: No token provided" },
                { status: 401, headers: corsHeaders }
            ),
        };
    }

    try {
        const decoded = verifyAccessToken(accessToken!) as DecodedToken;
        return { success: true, decoded };

    } catch (error: any) {

        if (refreshToken) {
            try {
                const decodedRefresh = verifyRefreshToken(refreshToken!) as DecodedToken;
                const newAccessToken = generateAccessToken({
                    id: decodedRefresh.id,
                    role: decodedRefresh.role,
                });

                const refreshedResponse = new NextResponse(null);
                refreshedResponse.cookies.set("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 15,
                });

                return {
                    success: true,
                    decoded: decodedRefresh,
                    response: refreshedResponse,
                };
            } catch {
                
                return {
                    success: false,
                    response: NextResponse.json(
                        { success: false, message: "Session expired: Kindly re-login" },
                        { status: 401, headers: corsHeaders }
                    ),
                };
            }
        }

        return {
            success: false,
            response: NextResponse.json(
                { success: false, message: "Unauthorized: Invalid token" },
                { status: 401, headers: corsHeaders }
            ),
        };
    }
}