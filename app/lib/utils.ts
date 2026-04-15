// lib/jwt.ts

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export const generateToken = (payload: any) => {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};