import connectDB from "@/db/connectDB";
import { UserModel } from "@/models/User";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

// ✅ OPTIONS - Preflight request handle karo
export async function OPTIONS() {
    return Response.json({}, { headers: corsHeaders })
}

// ✅ GET - Fetch all users
export async function GET() {
    try {
        await connectDB();
        const users = await UserModel.find();
        return Response.json({ success: true, users }, { headers: corsHeaders });
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
            id, username, gmail, password,
            firstName, lastName,
            phone, dob, bio, avatar,
            country, state, city, pincode, address,
        } = body;

        if (!id) {
            return Response.json({ success: false, message: "User ID required" }, { status: 400, headers: corsHeaders });
        }

        const updateData: Record<string, any> = {};

        if (firstName !== undefined || lastName !== undefined) {
            const current = await UserModel.findById(id);
            const currentFirst = current?.username?.split(" ")[0] ?? "";
            const currentLast = current?.username?.split(" ").slice(1).join(" ") ?? "";
            updateData.username = `${firstName ?? currentFirst} ${lastName ?? currentLast}`.trim();
        } else if (username !== undefined) {
            updateData.username = username;
        }

        if (gmail !== undefined) updateData.gmail = gmail;
        if (password !== undefined) updateData.password = password;
        if (phone !== undefined) updateData.phone = phone;
        if (dob !== undefined) updateData.dob = dob;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) updateData.avatar = avatar;

        if (country !== undefined || state !== undefined || city !== undefined || pincode !== undefined || address !== undefined) {
            const current = await UserModel.findById(id);
            const existing = current?.location ?? {};
            updateData.location = {
                country: country ?? existing.country ?? "",
                state: state ?? existing.state ?? "",
                city: city ?? existing.city ?? "",
                pincode: pincode ?? existing.pincode ?? "",
                address: address ?? existing.address ?? "",
            };
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 404, headers: corsHeaders });
        }

        return Response.json({ success: true, user: updatedUser }, { headers: corsHeaders });
    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}

// ✅ DELETE - Delete user
export async function DELETE(request: Request) {
    try {
        await connectDB();

        const { id } = await request.json();

        if (!id) {
            return Response.json({ success: false, message: "User ID required" }, { status: 400, headers: corsHeaders });
        }

        const deletedUser = await UserModel.findByIdAndDelete(id);

        if (!deletedUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 404, headers: corsHeaders });
        }

        return Response.json({ success: true, message: "User deleted" }, { headers: corsHeaders });
    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}