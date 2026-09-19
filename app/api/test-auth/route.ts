import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
}
