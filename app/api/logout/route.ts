import { cookies } from "next/dist/server/request/cookies";
import { NextRequest } from "next/server";



// ✅ CORS headers

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type , Authorization",
}
export async function POST() {
    try {
        const cookieStore = await cookies();

        // ✅ Clear both cookies
        cookieStore.set("accessToken", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 0, // ✅ instantly expires
        });

        cookieStore.set("refreshToken", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 0, // ✅ instantly expires
        });

        return Response.json({ success: true, message: "Logged out" }, { headers: corsHeaders });

    } catch (error) {
        return Response.json({ success: false, message: "Logout failed" }, { status: 500, headers: corsHeaders });
    }
}