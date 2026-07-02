import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://vikasbhattclasses.com",
];

export function getCorsHeaders(request: NextRequest) {
    const origin = request.headers.get("origin") || "";
    const isAllowed = allowedOrigins.includes(origin);
    const allowedOrigin = isAllowed ? origin : allowedOrigins[0];
    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        "Access-Control-Allow-Credentials": "true",
    };
}

export class ApiResponse {
    static success(data: Record<string, any> = {}, status = 200, headers?: Record<string, string>) {
        return NextResponse.json(
            { success: true, ...data },
            { status, headers: { ...getCorsHeaders(new NextRequest("http://localhost")), ...headers } }
        );
    }

    static error(message: string, status = 500, headers?: Record<string, string>) {
        return NextResponse.json(
            { success: false, message, error: message },
            { status, headers: { ...getCorsHeaders(new NextRequest("http://localhost")), ...headers } }
        );
    }
}
export function getCorsResponse(request: NextRequest, status = 200) {
    return NextResponse.json({}, { status, headers: getCorsHeaders(request) });
}
