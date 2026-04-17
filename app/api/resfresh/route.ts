import { DecodedToken } from "@/app/lib/middleware/page";
import { generateAccessToken, verifyRefreshToken } from "@/app/lib/utils";
import { cookies } from "next/dist/server/request/cookies";
import { NextRequest } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return Response.json(
                { success: false, message: "No refresh token" },
                { status: 401, headers: corsHeaders }
            );
        }

        const decoded = verifyRefreshToken(refreshToken) as DecodedToken;

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
            maxAge: 15 * 60,
        });

        return Response.json({ success: true }, { headers: corsHeaders });

    } catch (error) {
        return Response.json(
            { success: false, message: "Refresh token expired, login again" },
            { status: 401, headers: corsHeaders }
        );
    }
}