import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ["mongoose", "jsonwebtoken", "bcryptjs", "nodemailer"],
};


export default nextConfig;
