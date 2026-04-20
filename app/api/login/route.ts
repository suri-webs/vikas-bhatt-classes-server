import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import connectDB from "@/db/connectDB";
import { generateAccessToken, generateRefreshToken } from "@/app/lib/utils";
import { cookies } from "next/headers";

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

export async function POST(request: NextRequest) {
    const corsHeaders = getCorsHeaders(request);

    try {
        await connectDB();
        const body = await request.json();
        const { gmail, password, googleToken } = body;

        let user = null;

        if (googleToken) {
            const googleRes = await fetch(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`
            );
            const googleUser = await googleRes.json();

            if (!googleUser.email) {
                return NextResponse.json(
                    { success: false, message: "Invalid Google token" },
                    { status: 401, headers: corsHeaders }
                );
            }

            user = await UserModel.findOne({ gmail: googleUser.email });
            if (!user) {
                user = await UserModel.create({
                    username: googleUser.name,
                    gmail: googleUser.email,
                    password: "google-oauth",
                    avatar: googleUser.picture,
                    role: "student",
                });
            }
        } else {
            if (!gmail || !password) {
                return NextResponse.json(
                    { success: false, message: "Email and password required" },
                    { status: 400, headers: corsHeaders }
                );
            }

            user = await UserModel.findOne({ gmail });
            if (!user) {
                return NextResponse.json(
                    { success: false, message: "User not found" },
                    { status: 404, headers: corsHeaders }
                );
            }

            if (password !== user.password) {
                return NextResponse.json(
                    { success: false, message: "Invalid password" },
                    { status: 401, headers: corsHeaders }
                );
            }
        }

        const accessToken = generateAccessToken({ id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

        const cookieStore = await cookies();
        cookieStore.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60,
        });
        cookieStore.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });

        return NextResponse.json(
            { success: true, user },
            { headers: corsHeaders }
        );

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}