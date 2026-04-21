// lib/jwt.ts

import jwt, { JwtPayload } from "jsonwebtoken";

const SECRETR = process.env.REFRESH_TOKEN_SECRET!;
const SECRETA = process.env.ACCESS_TOKEN_SECRET!;


 export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export  const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, SECRETR) as JwtPayload;
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, SECRETA) as JwtPayload;
};