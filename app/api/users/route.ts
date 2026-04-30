import { withAuth } from "@/app/lib/middleware/auth";
import connectDB from "@/db/connectDB";
import { UserModel } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { ResultModel } from "@/models/Result";
const allowedOrigins = [
    "http://localhost:3000",
    "https://vikasbhattclasses.com",
];

function getCorsHeaders(request: NextRequest) {
    const origin = request.headers.get("origin") || "";
    const isAllowed = allowedOrigins.includes(origin);
    return {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const rollNumber = searchParams.get("rollNumber");
        const auth = withAuth(request);
        if (!auth.success) return auth.response;

        if (auth.decoded.role === "admin") {
            if (!rollNumber) {
                const users = await UserModel.find();
                return Response.json({ success: true, users }, { headers: getCorsHeaders(request) });
            } else {
                const user = await UserModel.findOne({ rollNumber }).populate("results");
                if (!user) {
                    return Response.json(
                        { success: false, error: "No user found with this RollNumber" },
                        { status: 404, headers: getCorsHeaders(request) }
                    );
                }
                return Response.json({ success: true, user }, { headers: getCorsHeaders(request) });
            }
        }

        if (auth.decoded.role === "student" && rollNumber) {
            const user = await UserModel.findOne({ rollNumber }).populate("results");
            if (!user) {
                return Response.json(
                    { success: false, error: "No user found with this RollNumber" },
                    { status: 404, headers: getCorsHeaders(request) }
                );
            }
            return Response.json({ success: true, user }, { headers: getCorsHeaders(request) });
        }

        return Response.json(
            { success: false, message: "Bad request" },
            { status: 400, headers: getCorsHeaders(request) }
        );

    } catch (error: any) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { username, gmail, password, role } = body;

        if (!username || !gmail || !password) {
            return Response.json(
                { success: false, message: "All fields required" },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const user = new UserModel({ username, gmail, password, role: role || "student" });
        await user.save();
        return Response.json({ success: true, user }, { headers: getCorsHeaders(request) });

    } catch (error: any) {
        if (error.code === 11000) {
            return Response.json(
                { success: false, error: "Duplicate key" },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }
        return Response.json(
            { success: false, error: error.message },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = withAuth(request);
        if (!auth.success) return auth.response;

        const body = await request.json();
        const {
            id, username, gmail, classIn,
            batch,
            phone, dob, bio, avatar, rollNumber,
            country, state, city, pincode, address,
        } = body;

        await connectDB();

        if (!id && !rollNumber) {
            return Response.json(
                { success: false, message: "User Id or Roll Number is required" },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const current = id
            ? await UserModel.findById(id)
            : await UserModel.findOne({ rollNumber });

        if (!current) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404, headers: getCorsHeaders(request) }
            );
        }

        const isAdmin = auth.decoded.role === "admin";
        const isSelf  = auth.decoded.id === current._id.toString();

        if (!isAdmin && !isSelf) {
            return Response.json(
                { success: false, message: "Forbidden: You can only edit your own profile" },
                { status: 403, headers: getCorsHeaders(request) }
            );
        }

        const updateData: Record<string, any> = {};

        // ✅ FIXED: Only block if rollNumber is actually being CHANGED, not just sent as same value
        if (rollNumber !== undefined) {
            const isSameRollNumber = String(rollNumber) === String(current.rollNumber);
            if (!isAdmin && !isSameRollNumber) {
                return Response.json(
                    { success: false, message: "Forbidden: Only admins can change roll number" },
                    { status: 403, headers: getCorsHeaders(request) }
                );
            }
            updateData.rollNumber = rollNumber;
        }

        if (username  !== undefined) updateData.username  = username;
        if (classIn   !== undefined) updateData.classIn   = classIn;
        if (batch     !== undefined) updateData.batch     = batch;
        if (gmail     !== undefined) updateData.gmail     = gmail;
        if (phone     !== undefined) updateData.phone     = phone;
        if (dob       !== undefined) updateData.dob       = dob;
        if (bio       !== undefined) updateData.bio       = bio;
        if (avatar    !== undefined) updateData.avatar    = avatar;

        if (
            country !== undefined || state   !== undefined ||
            city    !== undefined || pincode !== undefined || address !== undefined
        ) {
            const existing = current.location ?? {};
            updateData.location = {
                country: country ?? existing.country ?? "",
                state:   state   ?? existing.state   ?? "",
                city:    city    ?? existing.city    ?? "",
                pincode: pincode ?? existing.pincode ?? "",
                address: address ?? existing.address ?? "",
            };
        }

        if (Object.keys(updateData).length === 0) {
            return Response.json(
                { success: false, message: "No fields provided to update" },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            current._id,
            updateData,
            { new: true }
        );

        return Response.json(
            { success: true, user: updatedUser },
            { headers: getCorsHeaders(request) }
        );

    } catch (error: any) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return Response.json(
                { success: false, message: "Unauthorized: Invalid or expired token" },
                { status: 401, headers: getCorsHeaders(request) }
            );
        }
        return Response.json(
            { success: false, error: error.message },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const { rollNumber } = await request.json();
        const authHeader = withAuth(request);

        if (!authHeader.success || authHeader.decoded.role !== "admin") {
            return Response.json(
                { success: false, message: "Unauthorized user" },
                { status: 401, headers: getCorsHeaders(request) }
            );
        }

        if (!rollNumber) {
            return Response.json(
                { success: false, message: "Roll number required" },
                { status: 400, headers: getCorsHeaders(request) }
            );
        }

        const deletedUser = await UserModel.findOneAndDelete({ rollNumber });

        if (!deletedUser) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404, headers: getCorsHeaders(request) }
            );
        }

        return Response.json(
            { success: true, message: "User deleted" },
            { headers: getCorsHeaders(request) }
        );

    } catch (error: any) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500, headers: getCorsHeaders(request) }
        );
    }
}