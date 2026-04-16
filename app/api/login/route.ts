import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import connectDB from "@/db/connectDB";
import { generateAccessToken, generateRefreshToken } from "@/app/lib/utils";
import { cookies } from "next/headers";

// ✅ CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

// ✅ OPTIONS - Preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { gmail, password } = await request.json();

        if (!gmail || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const user = await UserModel.findOne({ gmail });
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


        const refreshToken = generateRefreshToken({
            id: user._id
        });

        const accessToken = generateAccessToken({
            id: user._id,
            role: user.role
        });


        const cookieStore = cookies();

        (await cookieStore).set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
             maxAge: 7 * 24 * 60 * 60, 
        });

        (await cookieStore).set("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60,
        });

      
        return NextResponse.json({
            success: true,
            user: user,
        }, { headers: corsHeaders });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}