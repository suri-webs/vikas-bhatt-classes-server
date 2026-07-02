import jwt, { JwtPayload } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be defined in environment variables");
}

export function generateAccessToken(payload: object | string): string {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
}

export function generateRefreshToken(payload: object | string): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
}

export function verifyAccessToken(token: string): JwtPayload | string {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token: string): JwtPayload | string {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}
