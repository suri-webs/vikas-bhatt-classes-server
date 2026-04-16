import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import connectDB from "@/db/connectDB";
import { generateToken } from "@/app/lib/utils";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type , Authorization",
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { gmail, password, googleToken } = body;

        // ── Google Login ──
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

            let user = await UserModel.findOne({ gmail: googleUser.email });
            if (!user) {
                user = await UserModel.create({
                    username: googleUser.name,
                    gmail: googleUser.email,
                    password: "google-oauth",
                    avatar: googleUser.picture,
                    role: "student",
                });
            }

            const token = generateToken({ id: user._id });
            return NextResponse.json({ success: true, user, token }, { headers: corsHeaders });
        }

        // ── Email/Password Login ──
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

        const token = generateToken({ id: user._id });
        return NextResponse.json({ success: true, user, token }, { headers: corsHeaders });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}