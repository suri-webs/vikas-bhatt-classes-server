import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import connectDB from "@/db/connectDB";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { gmail, password } = await request.json();

    if (!gmail || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ gmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Plain text password comparison (NOT SECURE)
    if (password !== user.password) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // Return user data to frontend
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        gmail: user.gmail,
        role: user.role,
      },
      token: "dummy-token", // Replace with real JWT later
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}