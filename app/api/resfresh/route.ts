import { DecodedToken } from "@/app/lib/middleware/page";
import { generateAccessToken, verifyRefreshToken } from "@/app/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "No refresh token" },
                { status: 401 }
            );
        }

        const decoded = verifyRefreshToken(refreshToken) as DecodedToken;

        const newAccessToken = generateAccessToken({
            id: decoded.id,
            role: decoded.role
        });

        const response = NextResponse.json({ success: true });

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60,
        });

        return response;

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Refresh token expired, login again" },
            { status: 401 }
        );
    }
}