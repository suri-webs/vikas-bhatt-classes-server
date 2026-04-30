import { withAuth } from "@/app/lib/middleware/auth";
import connectDB from "@/db/connectDB";
import { ResultModel } from "@/models/Result";
import { UserModel } from "@/models/User";
import { NextRequest } from "next/server";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://vikasbhattclasses.com",
];

function getCorsHeaders(request: NextRequest) {
    const origin = request.headers.get("origin") ?? "";
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}

export async function OPTIONS(request: NextRequest) {
    return Response.json({}, { headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest) {
    const corsHeaders = getCorsHeaders(request);
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const url = searchParams.get("url");
        const rollNumber = searchParams.get("rollNumber");

        const token = withAuth(request);
        if (!token.success) {
            return Response.json(
                { success: token.success },
                { status: token.response.status, headers: corsHeaders }
            );
        }

        if (token.decoded.role === "admin") {
            if (rollNumber) {
                const results = await ResultModel.find({ rollNumber });
                return Response.json({ results }, { headers: corsHeaders });
            } else {
                const results = await ResultModel.find();
                return Response.json({ results }, { headers: corsHeaders });
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
            console.log("here it check user")
            if (!user) {
                return Response.json(
                    { success: false, error: "User not found" },
                    { status: 404, headers: corsHeaders }
                );
            }
            console.log("here it check token")

            if (token.decoded.id !== user.id) {
                return Response.json(
                    { success: false, error: "Unauthorized user" },
                    { status: 403, headers: corsHeaders }
                );
            }

            
            if (url) {
                const resultByUrl = await ResultModel.findOne({
                    url,
                    rollNumber  // ✅ filter by rollNumber directly in query, no manual comparison
                });

                if (!resultByUrl) {
                    return Response.json(
                        { success: false, error: "Result not found" },
                        { status: 404, headers: corsHeaders }
                    );
                }

                return Response.json({ result: resultByUrl }, { headers: corsHeaders });
            }

            // ✅ no url → return whole array
            return Response.json({ results: user.results }, { headers: corsHeaders });
        }

    } catch (error: any) {
    return Response.json(
        { success: false, error: error.message },
        { status: 500, headers: getCorsHeaders(request) }
    );
}
}



export async function POST(request: NextRequest) {
    const corsHeaders = getCorsHeaders(request);
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
        const { rollNumber, url, subject, month, week, marksScored, totalMarks } = body;

        if (!rollNumber || !url || !subject || !month || !week || marksScored == null || totalMarks == null) {
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

        const result = await ResultModel.create({ rollNumber, url, month, subject, week, marksScored, totalMarks });
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

export async function PUT(request: NextRequest) {
    const corsHeaders = getCorsHeaders(request);
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
        const { id, url, subject, month, week, marksScored, totalMarks } = body;

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
        if (marksScored !== undefined) updateData.marksScored = marksScored;
        if (totalMarks !== undefined) updateData.totalMarks = totalMarks;

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

export async function DELETE(request: NextRequest) {
    const corsHeaders = getCorsHeaders(request);
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
        const { id } = body;

        if (!id) {
            return Response.json(
                { success: false, message: "Result ID required" },
                { status: 400, headers: corsHeaders }
            );
        }

        const deletedResult = await ResultModel.findByIdAndDelete(id);

        if (!deletedResult) {
            return Response.json(
                { success: false, message: "Result not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return Response.json({ success: true, message: "Result deleted" }, { headers: corsHeaders });

    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
    }
}