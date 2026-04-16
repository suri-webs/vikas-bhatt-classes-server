
import { DecodedToken } from "@/app/lib/middleware/page";
import { generateAccessToken, verifyRefreshToken } from "@/app/lib/utils";
import { cookies } from "next/dist/server/request/cookies";
import { NextRequest } from "next/server";
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return Response.json(
                { success: false, message: "No refresh token" },
                { status: 401, headers: corsHeaders }
            );
        }

        // ✅ Verify refresh token
        const decoded = verifyRefreshToken(refreshToken) as DecodedToken;

        // ✅ Issue new access token
        const newAccessToken = generateAccessToken({
            id: decoded.id,
            role: decoded.role
        });

        const cookieStore = await cookies();
        cookieStore.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60, // 15 minutes
        });

        return Response.json({ success: true }, { headers: corsHeaders });

    } catch (error) {
        return Response.json(
            { success: false, message: "Invalid or expired refresh token" },
            { status: 401, headers: corsHeaders }
        );
    }
}