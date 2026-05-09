import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO_EMAIL = "info@tsgwater.com";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL ?? "TSG Water <contact@tsgwater.com>";

  try {
    const data = await request.json();
    const {
      firstName,
      lastName,
      company,
      email,
      phone,
      location,
      capacity,
      timeline,
    } = data as Record<string, string>;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New assessment request — ${company || `${firstName} ${lastName}`}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><td><strong>Name</strong></td><td>${firstName} ${lastName}</td></tr>
          <tr><td><strong>Company</strong></td><td>${company || "—"}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${phone || "—"}</td></tr>
          <tr><td><strong>Project Location</strong></td><td>${location || "—"}</td></tr>
          <tr><td><strong>Capacity</strong></td><td>${capacity || "—"}</td></tr>
          <tr><td><strong>Timeline</strong></td><td>${timeline || "—"}</td></tr>
        </table>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 },
    );
  }
}
