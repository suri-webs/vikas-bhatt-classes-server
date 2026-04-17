import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully"
        });

        response.cookies.set("accessToken", "", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        return response;

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Logout failed" },
            { status: 500 }
        );
    }
}