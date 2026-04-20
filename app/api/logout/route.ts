    import { cookies } from "next/headers";

    export async function POST() {
        try {
            const cookieStore = await cookies();

            cookieStore.set("accessToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });

            cookieStore.set("refreshToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 0,
            });

            return Response.json({ success: true, message: "Logged out" });

        } catch (error) {
            return Response.json({ success: false, message: "Logout failed" }, { status: 500 });
        }
    }