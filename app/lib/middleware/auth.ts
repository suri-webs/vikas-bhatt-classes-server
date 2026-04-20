
import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/app/lib/utils";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export interface DecodedToken {
    id: string;
    role: string;
}


export type AuthResult =
    | { success: false; response: Response }
    | { success: true; decoded: DecodedToken };

export function withAuth(request: NextRequest): AuthResult {
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
        return {
            success: false,
            response: Response.json(
                { success: false, message: "Unauthorized: No token provided" },
                { status: 401, headers: corsHeaders }
            ),
        };
    }
    try {
        const decoded = verifyAccessToken(accessToken) as DecodedToken;
        return {
            success: true,
            decoded,
        };
    } catch (error: any) {
        const isJwtError =
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError";

        return {
            success: false,
            response: Response.json(
                {
                    success: false,
                    message: isJwtError
                        ? "Unauthorized: Invalid or expired token"
                        : "Unauthorized: Token verification failed",
                },
                { status: 401, headers: corsHeaders }
            ),
        };
    }
}