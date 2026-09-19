import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Here you would typically save to DB or send an email via SendGrid/Resend
    // For this scope, we'll just mock a successful response.
    console.log("Contact form submission:", { name, email, message });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });

  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}
