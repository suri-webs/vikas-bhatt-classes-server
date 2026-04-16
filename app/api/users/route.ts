import { withAuth } from "@/app/lib/middleware/page";
import { generateToken, verifyToken } from "@/app/lib/utils";
import connectDB from "@/db/connectDB";
import { UserModel } from "@/models/User";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type , Authorization",
}

// ✅ OPTIONS - Preflight request handle karo
export async function OPTIONS() {
    return Response.json({}, { headers: corsHeaders })
}

// ✅ GET - Fetch all users
export async function GET(request: Request) {

    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const rollNumber = searchParams.get("rollNumber");
        const role = searchParams.get("role");

        const auth = withAuth(request);
        if (!auth.success) return auth.response;

        // const isAdmin = auth.decoded.role === "admin";
        // const isSelf = auth.decoded.id === current._id.toString();
        // if (!isAdmin && !isSelf) {
        //     return Response.json(
        //         { success: false, message: "Forbidden: You can only edit your own profile" },
        //         { status: 403, headers: corsHeaders }
        //     );
        // }




        if (role === "admin") {
            if (!rollNumber) {
                const users = await UserModel.find();
                return Response.json({ success: true, users }, { headers: corsHeaders });
            }
            else {
                const user = await UserModel.findOne({ rollNumber });
                if (!user) {
                    return Response.json({ success: false, error: "No user found with this RollNumber, try again " }, { status: 404, headers: corsHeaders });
                }
                else {
                    return Response.json({ success: true, user }, { status: 200, headers: corsHeaders });
                }
            }
        }
        else {
            if (role === "student" && rollNumber !== null) {
                const user = await UserModel.findOne({ rollNumber });
                if (!user) {
                    return Response.json({ success: false, error: "No user found with this RollNumber, try again " }, { status: 404, headers: corsHeaders });
                }
                else {
                    return Response.json({ success: true, user }, { status: 200, headers: corsHeaders });
                }

            }
        }

    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}

// ✅ POST - Create new user (formData → JSON fix)
export async function POST(request: Request) {
    try {
        await connectDB();

        // ✅ JSON parse karo, formData nahi
        const body = await request.json()
        const { username, gmail, password, role } = body

        if (!username || !gmail || !password) {
            return Response.json(
                { success: false, message: "All fields required" },
                { status: 400, headers: corsHeaders }
            );
        }


        const user = new UserModel({ username, gmail, password, role: role || "student" });
        await user.save();
        const token = generateToken({
            id: user._id,
            role: user.role
        });

        // return NextResponse.json({
        //     success: true,
        //     user: user,
        //     token: token,
        // }, { headers: corsHeaders });



        return Response.json({ success: true, user }, { headers: corsHeaders });
    } catch (error: any) {
        if (error.code === 11000) {
            return Response.json({ success: false, error: "duplicate key" }, { status: 400, headers: corsHeaders });
        }
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}

// ✅ PUT - Update user profile
export async function PUT(request: Request) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            id, username, gmail, classIn,
            phone, dob, bio, avatar, rollNumber,
            country, state, city, pincode, address,
        } = body;

        // ── 1. Require at least one identifier ───────────────────────────
        if (!id && !rollNumber) {
            return Response.json(
                { success: false, message: "User Id or Roll Number is required" },
                { status: 400, headers: corsHeaders }
            );
        }
        const current = id
            ? await UserModel.findById(id)
            : await UserModel.findOne({ rollNumber });

        if (!current) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        const auth = withAuth(request);
        if (!auth.success) return auth.response;
        const isAdmin = auth.decoded.role === "admin";
        const isSelf = auth.decoded.id === current._id.toString();
        if (!isAdmin && !isSelf) {
            return Response.json(
                { success: false, message: "Forbidden: You can only edit your own profile" },
                { status: 403, headers: corsHeaders }
            );
        }

        const updateData: Record<string, any> = {};
        if (rollNumber !== undefined) {
            if (!isAdmin) {
                return Response.json(
                    { success: false, message: "Forbidden: Only admins can change roll number" },
                    { status: 403, headers: corsHeaders }
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
                { status: 400, headers: corsHeaders }
            );
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
            current._id,
            updateData,
            { new: true }
        );

        return Response.json({ success: true, user: updatedUser }, { headers: corsHeaders });

    } catch (error: any) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return Response.json(
                { success: false, message: "Unauthorized: Invalid or expired token" },
                { status: 401, headers: corsHeaders }
            );
        }
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}
// ✅ DELETE - Delete user
export async function DELETE(request: Request) {
    try {
        await connectDB();
        //need roll number and the who delete must be admin .
        const { rollNumber } = await request.json();


        const authHeader = withAuth(request)


        if (authHeader.success && authHeader.decoded.role === "admin") {
            if (!rollNumber) {
                return Response.json({ success: false, message: "User ID required" }, { status: 400, headers: corsHeaders });
            }

            const deletedUser = await UserModel.findOneAndDelete(rollNumber);

            if (!deletedUser) {
                return Response.json({ success: false, message: "User not found" }, { status: 404, headers: corsHeaders });
            }

            return Response.json({ success: true, message: "User deleted" }, { headers: corsHeaders });
        }
        else {
            return Response.json({ success: false, message: "Unauthorized user" }, { status: 401, headers: corsHeaders });
        }
    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}