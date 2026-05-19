import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

type ContactPayload = {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  capacity?: string;
  timeline?: string;
};

const LEAD_RECIPIENT = "info@tsgwater.com";
// tsgwater.com is verified in Resend, so we send from the brand domain.
// replyTo (set per-submission below) points back to the lead's email, so
// when info@tsgwater.com hits "Reply" it goes directly to the prospect.
const FROM = "TSG Water Resources <noreply@tsgwater.com>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function v(s: string | undefined): string {
  const t = (s ?? "").trim();
  return t || "—";
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as ContactPayload;
    console.log("New contact form submission:", data);

    const resendApiKey = getEnv("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — email send skipped");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const fullName = `${v(data.firstName)} ${v(data.lastName)}`
      .replace(/—/g, "")
      .trim();
    const subject = `New TSG inquiry — ${v(data.company)}`;
    const replyTo = data.email?.trim() || undefined;

    const html = `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; color: #0f172a;">
        <h2 style="color: #263285; margin: 0 0 16px;">New TSG Water Resources inquiry</h2>
        <table style="border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 16px 6px 0; color: #64748b;">Name</td><td>${escapeHtml(fullName || "—")}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #64748b;">Email</td><td>${escapeHtml(v(data.email))}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #64748b;">Phone</td><td>${escapeHtml(v(data.phone))}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #64748b;">Company</td><td><strong>${escapeHtml(v(data.company))}</strong></td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <table style="border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 16px 6px 0; color: #64748b;">Project Location</td><td>${escapeHtml(v(data.location))}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #64748b;">Capacity</td><td>${escapeHtml(v(data.capacity))}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #64748b;">Timeline</td><td>${escapeHtml(v(data.timeline))}</td></tr>
        </table>
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
          Reply to this email to respond to the lead directly.
        </p>
      </div>
    `;

    const text = [
      "New TSG Water Resources inquiry",
      "",
      `Name:     ${fullName || "—"}`,
      `Email:    ${v(data.email)}`,
      `Phone:    ${v(data.phone)}`,
      `Company:  ${v(data.company)}`,
      "",
      `Location: ${v(data.location)}`,
      `Capacity: ${v(data.capacity)}`,
      `Timeline: ${v(data.timeline)}`,
      "",
      "Reply to this email to respond to the lead directly.",
    ].join("\n");

    const resendRes = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [LEAD_RECIPIENT],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!resendRes.ok) {
      // Resend failed — log it for diagnosis but still return 200 so the
      // user sees the success card. Raw submission is preserved in the
      // console.log above (visible in function logs).
      const body = await resendRes.text().catch(() => "");
      console.error("Resend send error:", resendRes.status, body);
    }

    return NextResponse.json(
      { success: true, message: "Submission received" },
      { status: 200 },
    );
  } catch (err) {
    // Any unexpected failure (bad JSON, SDK throw, etc.) — log and still
    // return 200. Submission may or may not be in logs depending on where
    // it failed, but the user-facing form will show success.
    console.error("Contact route error:", err);
    return NextResponse.json(
      { success: true, message: "Submission received" },
      { status: 200 },
    );
  }
}
