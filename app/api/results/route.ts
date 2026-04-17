import { withAuth } from "@/app/lib/middleware/page";
import connectDB from "@/db/connectDB";
import { ResultModel } from "@/models/Result";
import { UserModel } from "@/models/User";
import { NextRequest } from "next/server";
import { success } from "zod";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type , Authorization",
}

export async function OPTIONS() {
    return Response.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const rollNumber = searchParams.get("rollNumber");

        const token = withAuth(request);
        if (!token.success) {
            return Response.json(
                { success: token.success },
                { status: 403, headers: corsHeaders }
            )
        }

        //  ADMIN LOGIC
        if (token.decoded.role === "admin") {
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
        if (token.decoded.role === "student") {
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
            if (token.decoded.id !== user.id) {
                return Response.json(
                    { success: false, error: "Unauthorized user" },
                    { status: 403, headers: corsHeaders }
                );
            }

            return Response.json(
                { results: user.results },
                { headers: corsHeaders }
            );

        }
    } catch (error: any) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function POST(request: NextRequest) {
    try {

        const auth = withAuth(request);
        if (!auth.success) return auth.response;
        if (auth.decoded.role !== "admin") {
            return Response.json(
                { success: false, message: "Forbidden: Admins only" },
                { status: 403, headers: corsHeaders }
            );
        }

        await connectDB();

        const body = await request.json();
        const { rollNumber, url, subject, month, week } = body;

        if (!rollNumber || !url || !subject || !month || !week) {
            return Response.json(
                { success: false, message: "All fields required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const user = await UserModel.findOne({ rollNumber });
        if (!user) {
            return Response.json(
                { success: false, message: "No user found with given roll number" },
                { status: 404, headers: corsHeaders }
            );
        }

        const result = await ResultModel.create({ rollNumber, url, month, subject, week });
        user.results.push(result._id);
        await user.save();

        return Response.json({ success: true, result }, { headers: corsHeaders });

    } catch (error) {
        if ((error as any).code === 11000) {
            return Response.json(
                { success: false, message: "Result already exists" },
                { status: 400, headers: corsHeaders }
            );
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        return Response.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
    }
}

// ✅ PUT - Update user profile
//if admin
export async function PUT(request: NextRequest) {
    try {
        const auth = withAuth(request);
        if (!auth.success) return auth.response;

        // ✅ Role from verified token, not URL params
        if (auth.decoded.role !== "admin") {
            return Response.json(
                { success: false, message: "Forbidden: Admins only" },
                { status: 403, headers: corsHeaders }
            );
        }

        await connectDB();

        const body = await request.json();
        const { id, url, subject, month, week } = body;

        if (!id) {
            return Response.json(
                { success: false, message: "Result ID required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const updateData: Record<string, any> = {};
        if (url !== undefined) updateData.url = url;
        if (subject !== undefined) updateData.subject = subject;
        if (month !== undefined) updateData.month = month;
        if (week !== undefined) updateData.week = week;

        if (Object.keys(updateData).length === 0) {
            return Response.json(
                { success: false, message: "No fields provided to update" },
                { status: 400, headers: corsHeaders }
            );
        }

        const updatedResult = await ResultModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedResult) {
            return Response.json(
                { success: false, message: "Result not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return Response.json({ success: true, result: updatedResult }, { headers: corsHeaders });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return Response.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
    }
}

// ✅ DELETE - Delete Result
//only admin
export async function DELETE(request: NextRequest) {
    try {

        const auth = withAuth(request);
        if (!auth.success) return auth.response;

        if (auth.decoded.role !== "admin") {
            return Response.json(
                { success: false, message: "Forbidden: Admins only" },
                { status: 403, headers: corsHeaders }
            );
        }

        await connectDB();

        const role = auth.decoded.role;
        // Give only " id "
       const body = await request.json();
        const { id } = body;


        if (!id) {
            return Response.json({ success: false, message: "Result ID required" }, { status: 400, headers: corsHeaders });
        }
        if (role !== "admin") {
            return Response.json({ success: false, message: "Unsuthorized user" }, { status: 401, headers: corsHeaders });
        }

        const deletedResult = await ResultModel.findByIdAndDelete(id);

        if (!deletedResult) {
            return Response.json({ success: false, message: "Result no found" }, { status: 404, headers: corsHeaders });
        }

        return Response.json({ success: true, message: "Result deleted" }, { headers: corsHeaders });

    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}