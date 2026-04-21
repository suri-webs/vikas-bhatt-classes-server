import { withAuth } from "@/app/lib/middleware/auth";
import connectDB from "@/db/connectDB";
import { UserModel } from "@/models/User";
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
        "Access-Control-Allow-Methods": "POST,GET,  PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: getcorsHeaders(request) });
}


// ✅ GET - Fetch all users
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
                return Response.json({ success: true, users }, { headers: getcorsHeaders(request) });
            }
            else {
                const user = await UserModel.findOne({ rollNumber });
                if (!user) {
                    return Response.json({ success: false, error: "No user found with this RollNumber, try again " }, { status: 404, headers: getcorsHeaders(request) });
                }
                else {
                    return Response.json({ success: true, user }, { status: 200, headers: getcorsHeaders(request) });
                }
            }
        }
        else {
            if (auth.decoded.role === "student" && rollNumber !== null) {
                const user = await UserModel.findOne({ rollNumber });
                if (!user) {
                    return Response.json({ success: false, error: "No user found with this RollNumber, try again " }, { status: 404, headers: getcorsHeaders(request) });
                }
                else {
                    return Response.json({ success: true, user }, { status: 200, headers: getcorsHeaders(request) });
                }

            }
        }

    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: getcorsHeaders(request) });
    }
}

// ✅ POST - Create new user (formData → JSON fix)
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // ✅ JSON parse karo, formData nahi
        const body = await request.json()
        const { username, gmail, password, role } = body

        if (!username || !gmail || !password) {
            return Response.json(
                { success: false, message: "All fields required" },
                { status: 400, headers: getcorsHeaders(request) }
            );
        }


        const user = new UserModel({ username, gmail, password, role: role || "student" });
        await user.save();


        return Response.json({ success: true, user }, { headers: getcorsHeaders(request) });
    } catch (error: any) {
        if (error.code === 11000) {
            return Response.json({ success: false, error: "duplicate key" }, { status: 400, headers: getcorsHeaders(request) });
        }
        return Response.json({ success: false, error: error.message }, { status: 500, headers: getcorsHeaders(request) });
    }
}

// ✅ PUT - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const auth = withAuth(request);
        if (!auth.success) return auth.response;

        await connectDB();

        const body = await request.json();
        const {
            id, username, gmail, classIn,
            phone, dob, bio, avatar, rollNumber,
            country, state, city, pincode, address,
        } = body;

        // define these first before using them
        const isAdmin = auth.decoded.role === "admin";
        const userId = isAdmin && id ? id : auth.decoded.id;

        const current = await UserModel.findById(userId);

        if (!current) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404, headers: getcorsHeaders(request) }
            );
        }

        const isSelf = auth.decoded.id === current._id.toString();

        if (!isAdmin && !isSelf) {
            return Response.json(
                { success: false, message: "Forbidden: You can only edit your own profile" },
                { status: 403, headers: getcorsHeaders(request) }
            );
        }

        const updateData: Record<string, any> = {};

        if (rollNumber !== undefined) {
            if (!isAdmin) {
                return Response.json(
                    { success: false, message: "Forbidden: Only admins can change roll number" },
                    { status: 403, headers: getcorsHeaders(request) }
                );
            }
            updateData.rollNumber = rollNumber;
        }

        if (username !== undefined) updateData.username = username;
        if (classIn !== undefined) updateData.classIn = classIn;
        if (gmail !== undefined) updateData.gmail = gmail;
        if (phone !== undefined) updateData.phone = phone;
        if (dob !== undefined) updateData.dob = dob;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) updateData.avatar = avatar;

        if (country !== undefined || state !== undefined ||
            city !== undefined || pincode !== undefined || address !== undefined) {
            const existing = current.location ?? {};
            updateData.location = {
                country: country ?? existing.country ?? "",
                state: state ?? existing.state ?? "",
                city: city ?? existing.city ?? "",
                pincode: pincode ?? existing.pincode ?? "",
                address: address ?? existing.address ?? "",
            };
        }

        if (Object.keys(updateData).length === 0) {
            return Response.json(
                { success: false, message: "No fields provided to update" },
                { status: 400, headers: getcorsHeaders(request) }
            );
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            current._id,
            updateData,
            { new: true }
        );

        return Response.json({ success: true, user: updatedUser }, { headers: getcorsHeaders(request) });

    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: getcorsHeaders(request) });
    }
}




// ✅ DELETE - Delete user
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        //need roll number and the who delete must be admin .
        const { rollNumber } = await request.json();


        const authHeader = withAuth(request)


        if (authHeader.success && authHeader.decoded.role === "admin") {
            if (!rollNumber) {
                return Response.json({ success: false, message: "User ID required" }, { status: 400, headers: getcorsHeaders(request) });
            }

            const deletedUser = await UserModel.findOneAndDelete(rollNumber);

            if (!deletedUser) {
                return Response.json({ success: false, message: "User not found" }, { status: 404, headers: getcorsHeaders(request) });
            }

            return Response.json({ success: true, message: "User deleted" }, { headers: getcorsHeaders(request) });
        }
        else {
            return Response.json({ success: false, message: "Unauthorized user" }, { status: 401, headers: getcorsHeaders(request) });
        }
    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: getcorsHeaders(request) });
    }
}