import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/repo/sessions";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const c = await cookies();
  const sessionId = c.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteSession(sessionId);
  }
  const response = NextResponse.redirect(`${url.origin}/`, { status: 303 });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
