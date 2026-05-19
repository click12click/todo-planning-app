import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuthorizeUrl } from "@/lib/auth/github";
import {
  STATE_COOKIE,
  STATE_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

function setupPageHtml(): string {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>GitHub OAuth 설정 필요</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 4rem auto; padding: 0 1rem; line-height: 1.6; color: #1f2937; }
  h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  ol { padding-left: 1.25rem; }
  code { background: #f3f4f6; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; }
  pre { background: #f3f4f6; padding: 0.75rem; border-radius: 6px; overflow-x: auto; font-size: 0.85em; }
  a { color: #2563eb; }
  .note { color: #6b7280; font-size: 0.9em; margin-top: 1.5rem; }
</style>
</head>
<body>
<h1>GitHub OAuth 자격증명이 설정되지 않았습니다</h1>
<p>로그인을 사용하려면 GitHub OAuth App을 생성하고 <code>.env</code>에 자격증명을 채워 넣어야 합니다.</p>
<ol>
  <li><a href="https://github.com/settings/developers" target="_blank" rel="noreferrer">github.com/settings/developers</a> → <b>OAuth Apps → New OAuth App</b></li>
  <li>Homepage URL: <code>http://localhost:3000</code></li>
  <li>Authorization callback URL: <code>http://localhost:3000/auth/github/callback</code></li>
  <li>발급된 <b>Client ID</b>와 <b>Client Secret</b>을 프로젝트 루트의 <code>.env</code>에 추가:
    <pre>GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...</pre>
  </li>
  <li>dev 서버 재시작 후 다시 시도</li>
</ol>
<p class="note">자세한 안내는 <code>docs/LOGIN-SETUP.md</code> 참고. <code>.env</code>는 <code>.gitignore</code>에 포함되어 있어 안전하게 보관됩니다.</p>
</body>
</html>`;
}

export async function GET(request: Request) {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return new NextResponse(setupPageHtml(), {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const url = new URL(request.url);
  const redirectUri = `${url.origin}/auth/github/callback`;
  const state = randomBytes(16).toString("hex");

  const response = NextResponse.redirect(getAuthorizeUrl(state, redirectUri));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
