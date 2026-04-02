import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://vikasbhattclasses.com",
    "https://www.vikasbhattclasses.com",
];

const protectedRoutes = ["/api/users"];  // routes that need JWT

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const origin = request.headers.get("origin") || "";

    // ✅ Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true",
            },
        });
    }

    // ✅ Protect routes — check JWT token
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected) {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1]; // Bearer <token>

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - No token" },
                { status: 401 }
            );
        }

        // Token verification happens in individual route handlers
        // because Edge runtime can't use jsonwebtoken directly
    }

    // ✅ Add CORS headers to all API responses
    const response = NextResponse.next();

    if (allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
}

export const config = {
    matcher: "/api/:path*",
};