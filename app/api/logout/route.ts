import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";



const allowedOrigins = [
    "http://localhost:3000",
    "https://vikasbhattclasses.com",
];

function getcorsHeaders(request: NextRequest) {
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
    return NextResponse.json({}, { headers: getcorsHeaders(request) });
}



export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        cookieStore.set("refreshToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        cookieStore.set("accessToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        return NextResponse.json(
            { success: true, message: "Logged out" },
            { headers:getcorsHeaders(request) }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Logout failed" },
            { status: 500, headers: getcorsHeaders(request) }
        );
    }
}