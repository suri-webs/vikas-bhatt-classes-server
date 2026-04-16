import connectDB from "@/db/connectDB";
import { ResultModel } from "@/models/Result";
import { UserModel } from "@/models/User";
import { NextRequest } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
}

export async function OPTIONS() {
    return Response.json({}, { headers: corsHeaders })
}

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const username = searchParams.get("userName");
        const rollNumber = searchParams.get("rollNumber");
        const role = searchParams.get("role");

        //  ADMIN LOGIC
        if (role === "admin") {
            if (rollNumber) {
                // Admin → specific student's results
                const results = await ResultModel.find({ rollNumber });

                return Response.json(
                    { results },
                    { headers: corsHeaders }
                );
            }

            else {
                const results = await ResultModel.find();

                return Response.json(
                    { results },
                    { headers: corsHeaders }
                );
            }
        }
        if (!rollNumber) {
            return Response.json(
                { success: false, error: "rollNumber is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const user = await UserModel.findOne({ rollNumber }).populate("results");

        if (!user) {
            return Response.json(
                { success: false, error: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }
        if (username && user.username !== username) {
            return Response.json(
                { success: false, error: "Unauthorized user" },
                { status: 403, headers: corsHeaders }
            );
        }

        return Response.json(
            { results: user.results },
            { headers: corsHeaders }
        );

    } catch (error: any) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}


export async function POST(request: Request) {
    try {
        await connectDB();

        // ✅ JSON parse karo, formData nahi
        const body = await request.json()
        const { rollNumber, role, url, subject, month, week } = body

        if (!rollNumber || !role || !url || !subject || !month || !week) {
            return Response.json(
                { success: false, message: "All fields required" },
                { status: 400, headers: corsHeaders }
            );
        }

        if (role === "admin") {
            const user = await UserModel.findOne({ rollNumber });
            if (!user) {
                return Response.json({ success: false, error: "No data found with given credentials" }, { status: 404 });
            }
            //first add url in array of result in user model
            const result = await ResultModel.create({ rollNumber, url, month, subject, week });
            user.results.push(result);
            await user.save();

            return Response.json({ success: true, result }, { headers: corsHeaders });
        }
        else {
            return Response.json({ success: false, error: "Unauthorized User" }, { status: 401 });
        }


    } catch (error: any) {
        if (error.code === 11000) {
            return Response.json({ success: false, error: "duplicate key" }, { status: 400, headers: corsHeaders });
        }
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}

// ✅ PUT - Update user profile
//if admin
export async function PUT(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");
        const body = await request.json();
        const {
            id, url, subject, month, week
        } = body;

        if (!id) {
            return Response.json({ success: false, message: "User ID required" }, { status: 400, headers: corsHeaders });
        }
        if (role === "admin") {

            const updateData: Record<string, any> = {};


            if (url !== undefined) updateData.url = url;
            if (subject !== undefined) updateData.subject = subject;
            if (month !== undefined) updateData.month = month;
            if (week !== undefined) updateData.week = week;


            const updatedResult = await ResultModel.findByIdAndUpdate(id, updateData, { new: true });

            if (!updatedResult) {
                return Response.json({ success: false, message: "User not found" }, { status: 404, headers: corsHeaders });
            }

            return Response.json({ success: true, user: updatedResult }, { headers: corsHeaders });
        }
        else {
            return Response.json({ success: false, error: "Unauthorized user" }, { status: 401, headers: corsHeaders });
        }
    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }

}

// ✅ DELETE - Delete Result
//only admin
export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");
        const { id } = await request.json();

        if (!id) {
            return Response.json({ success: false, message: "User ID required" }, { status: 400, headers: corsHeaders });
        }
        if (role !== "admin") {
            return Response.json({ success: false, message: "Unsuthorized user" }, { status: 401, headers: corsHeaders });
        }

        const deletedResult = await ResultModel.findByIdAndDelete(id);

        if (!deletedResult) {
            return Response.json({ success: false, message: "User no found" }, { status: 404, headers: corsHeaders });
        }

        return Response.json({ success: true, message: "User deleted" }, { headers: corsHeaders });

    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}