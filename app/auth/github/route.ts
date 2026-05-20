import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuthorizeUrl } from "@/lib/auth/github";
import {
  STATE_COOKIE,
  STATE_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function badge(ok: boolean): string {
  return ok
    ? '<span style="color:#15803d">✓ present</span>'
    : '<span style="color:#b91c1c">✗ missing</span>';
}

function setupPageHtml(origin: string): string {
  const safeOrigin = escapeHtml(origin);
  const isLocal =
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1");

  const hasClientId = Boolean(process.env.GITHUB_CLIENT_ID);
  const hasClientSecret = Boolean(process.env.GITHUB_CLIENT_SECRET);
  const hasMongo = Boolean(process.env.MONGODB_URI);
  const vercelEnv = process.env.VERCEL_ENV ?? "(unset — not a Vercel runtime)";
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "(unset)";

  const envHowto = isLocal
    ? `프로젝트 루트의 <code>.env</code> 파일에 다음을 추가하고 <b>dev 서버를 재시작</b>:
<pre>GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...</pre>`
    : `이 사이트는 호스팅 환경에서 동작합니다. <b>로컬 <code>.env</code> 파일은 호스팅에 절대 반영되지 않습니다.</b><br/>
호스팅 대시보드의 <b>Environment Variables</b> 설정에서 두 키를 추가하고 <b>Redeploy</b>:
<pre>GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...</pre>
Vercel: 프로젝트 → Settings → Environment Variables → <b>Production / Preview / Development 모두 체크</b> → Deployments → Redeploy.`;

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>GitHub OAuth 설정 필요</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 3rem auto; padding: 0 1rem; line-height: 1.65; color: #1f2937; }
  h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1rem; margin-top: 2rem; margin-bottom: 0.5rem; color: #4b5563; }
  ol { padding-left: 1.25rem; }
  li { margin-bottom: 0.5rem; }
  code { background: #f3f4f6; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; }
  pre { background: #f3f4f6; padding: 0.75rem; border-radius: 6px; overflow-x: auto; font-size: 0.85em; margin: 0.5rem 0; }
  table { border-collapse: collapse; font-size: 0.9em; margin-bottom: 1rem; }
  td, th { border: 1px solid #e5e7eb; padding: 0.4rem 0.75rem; text-align: left; }
  th { background: #f9fafb; }
  .host { background: #fef3c7; padding: 0.1em 0.4em; border-radius: 4px; }
  .note { color: #6b7280; font-size: 0.88em; }
  a { color: #2563eb; }
</style>
</head>
<body>
<h1>GitHub OAuth 자격증명이 설정되지 않았습니다</h1>

<h2>런타임 진단</h2>
<table>
<tr><th>키</th><th>상태</th></tr>
<tr><td><code>GITHUB_CLIENT_ID</code></td><td>${badge(hasClientId)}</td></tr>
<tr><td><code>GITHUB_CLIENT_SECRET</code></td><td>${badge(hasClientSecret)}</td></tr>
<tr><td><code>MONGODB_URI</code></td><td>${badge(hasMongo)}</td></tr>
<tr><td><code>VERCEL_ENV</code></td><td>${escapeHtml(vercelEnv)}</td></tr>
<tr><td><code>VERCEL_GIT_COMMIT_SHA</code></td><td>${escapeHtml(commit)}</td></tr>
<tr><td>현재 호스트</td><td><span class="host">${safeOrigin}</span></td></tr>
</table>
<p class="note">
위 진단표가 이 deployment 런타임이 실제로 보는 값입니다.
<code>missing</code> 표시된 키가 호스팅 env에 정말 등록돼 있는데도 missing이라면:
(1) 그 env가 현재 deployment 환경(Production/Preview/Development)에 체크돼 있지 않거나,
(2) 이 페이지가 env 추가 이전 deployment의 응답(Vercel 또는 브라우저 캐시)입니다.
<code>VERCEL_GIT_COMMIT_SHA</code>가 최신 commit과 다르면 (2)가 확실합니다.
</p>

<h2>설정 단계</h2>
<ol>
  <li><a href="https://github.com/settings/developers" target="_blank" rel="noreferrer">github.com/settings/developers</a> → <b>OAuth Apps → New OAuth App</b></li>
  <li>Homepage URL: <code>${safeOrigin}</code></li>
  <li>Authorization callback URL: <code>${safeOrigin}/auth/github/callback</code></li>
  <li>발급된 <b>Client ID</b>와 <b>Client Secret</b>을 다음과 같이 설정:<br/>${envHowto}</li>
</ol>

<p class="note">자세한 안내는 <code>docs/LOGIN-SETUP.md</code> 참고.</p>
</body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return new NextResponse(setupPageHtml(url.origin), {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    });
  }

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
