const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const USER_URL = "https://api.github.com/user";

function getEnv(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "GITHUB_CLIENT_ID 와 GITHUB_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.",
    );
  }
  return { clientId, clientSecret };
}

export function getAuthorizeUrl(state: string, redirectUri: string): string {
  const { clientId } = getEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user",
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<string> {
  const { clientId, clientSecret } = getEnv();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub 토큰 교환 실패: ${res.status}`);
  }
  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!data.access_token) {
    throw new Error(
      `GitHub 토큰 응답에 access_token 없음: ${data.error ?? "unknown"}`,
    );
  }
  return data.access_token;
}

export interface GithubUserInfo {
  id: number;
  login: string;
  avatar_url: string;
}

export async function fetchGithubUser(
  accessToken: string,
): Promise<GithubUserInfo> {
  const res = await fetch(USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "ch05-todoapp",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub 사용자 조회 실패: ${res.status}`);
  }
  return res.json();
}
