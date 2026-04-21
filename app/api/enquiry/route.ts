import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ── Types ──────────────────────────────────────────────────────────────────

interface EnquiryPayload {
    name: string;
    phone: string;
    classLevel: string;
    subject: string;
    message?: string;
    source?: "contact-page" | "popup";
}

const allowedOrigins = [
    "http://localhost:3000",
    "https://vikasbhattclasses.com",
];

function getgetcorsHeaders(request: NextRequest) {
    const origin = request.headers.get("origin") || "";
    const isAllowed = allowedOrigins.includes(origin);
    return {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}



export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, { headers: getgetcorsHeaders(request) });
}


// ── Transporter ────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ── Helper: build the admin notification email ────────────────────────────

function buildAdminMail(data: EnquiryPayload) {
    return {
        from: `"VBC Enquiry" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_TO_EMAIL ?? process.env.SMTP_USER,
        subject: `📩 New Enquiry from ${data.name}`,
        html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <div style="background:#0BBFE0;padding:24px 32px;border-radius:12px 12px 0 0">
          <h2 style="margin:0;color:#fff;font-size:20px">New Enquiry — Vikas Bhatt Classes</h2>
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px;background:#fff">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:140px">Name</td>
                <td style="padding:8px 0;font-weight:600">${data.name}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b;font-size:13px">Phone</td>
                <td style="padding:8px 4px;font-weight:600">${data.phone}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Class / Level</td>
                <td style="padding:8px 0;font-weight:600">${data.classLevel}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px 4px;color:#64748b;font-size:13px">Subject</td>
                <td style="padding:8px 4px;font-weight:600">${data.subject}</td></tr>
            ${data.message ? `
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;vertical-align:top">Message</td>
                <td style="padding:8px 0">${data.message}</td></tr>` : ""}
          </table>
          <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">
            Source: ${data.source ?? "unknown"} · ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
          </p>
        </div>
      </div>`,
    };
}

// ── Helper: build the auto-reply for the student ──────────────────────────

function buildAutoReply(data: EnquiryPayload & { email?: string }) {
    if (!data.email) return null;
    return {
        from: `"Vikas Bhatt Classes" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: "We received your enquiry ✅",
        html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
        <div style="background:#0BBFE0;padding:20px 28px;border-radius:12px 12px 0 0">
          <h2 style="margin:0;color:#fff;font-size:18px">Thanks for reaching out!</h2>
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px;background:#fff">
          <p>Hi <strong>${data.name}</strong>,</p>
          <p style="color:#475569;line-height:1.6">
            We've received your enquiry for <strong>${data.subject}</strong> (${data.classLevel}).
            Our team will call you on <strong>${data.phone}</strong> shortly.
          </p>
          <p style="color:#475569">— Vikas Bhatt Classes Team</p>
        </div>
      </div>`,
    };
}

// ── POST handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as EnquiryPayload & { email?: string };

        const { name, phone, classLevel, subject } = body;
        if (!name || !phone || !classLevel || !subject) {
            return NextResponse.json(
                { success: false, message: "Missing required fields." },
                { status: 400, headers: getgetcorsHeaders(req) }  // ✅
            );
        }

        await transporter.sendMail(buildAdminMail(body));

        const autoReply = buildAutoReply(body);
        if (autoReply) await transporter.sendMail(autoReply);

        return NextResponse.json(
            { success: true },
            { headers: getgetcorsHeaders(req) }  // ✅
        );
    } catch (err) {
        console.error("[enquiry] mail error:", err);
        return NextResponse.json(
            { success: false, message: "Failed to send email. Please try again." },
            { status: 500, headers: getgetcorsHeaders(req) }  // ✅
        );
    }
}