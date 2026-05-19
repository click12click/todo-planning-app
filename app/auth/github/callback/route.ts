import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode, fetchGithubUser } from "@/lib/auth/github";
import { upsertUserByGithubId } from "@/lib/repo/users";
import { createSession, SESSION_TTL_DAYS } from "@/lib/repo/sessions";
import { STATE_COOKIE } from "@/lib/auth/constants";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.json(
      { error: "code 또는 state 가 누락되었습니다." },
      { status: 400 },
    );
  }

  const c = await cookies();
  const storedState = c.get(STATE_COOKIE)?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.json(
      { error: "state 가 일치하지 않습니다." },
      { status: 400 },
    );
  }

  const redirectUri = `${url.origin}/auth/github/callback`;
  const accessToken = await exchangeCode(code, redirectUri);
  const ghUser = await fetchGithubUser(accessToken);

  const user = await upsertUserByGithubId({
    githubId: ghUser.id,
    username: ghUser.login,
    avatarUrl: ghUser.avatar_url,
  });

  const session = await createSession(user.id);

  const response = NextResponse.redirect(`${url.origin}/`);
  response.cookies.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
  response.cookies.delete(STATE_COOKIE);
  return response;
}
