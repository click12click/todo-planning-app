# GitHub OAuth 로그인 설정 가이드

이 챕터의 로그인 기능은 GitHub OAuth App을 사용합니다. 아래 단계로 자신만의 OAuth App을 만든 뒤 `.env`에 자격증명을 채워 넣으면 됩니다.

## 1. GitHub OAuth App 생성

1. https://github.com/settings/developers 접속
2. **OAuth Apps → New OAuth App** 클릭
3. 다음 값으로 채워 넣기:
   - **Application name**: 원하는 이름 (예: `ch05-todoapp-dev`)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. **Register application** 클릭
5. 생성된 앱 페이지에서 **Client ID** 복사
6. **Generate a new client secret** 클릭 후 발급된 **Client Secret** 복사 (이 값은 다시 볼 수 없으니 즉시 저장)

## 2. `.env` 파일 작성

저장소 루트의 `.env.example`을 복사해 `.env`를 만들고 발급된 값을 채워 넣습니다.

```sh
copy .env.example .env   # Windows
cp .env.example .env     # macOS / Linux
```

```env
MONGODB_URI=mongodb+srv://...
GITHUB_CLIENT_ID=Iv1.abcdef1234567890
GITHUB_CLIENT_SECRET=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> `.env`는 이미 `.gitignore`에 포함돼 있어 커밋되지 않습니다. **CLIENT_SECRET을 코드에 하드코딩하거나 공개 채널에 노출하지 마세요.**

## 3. 기존 데이터 마이그레이션

기존 `tasks` 컬렉션의 문서에 `userId` 필드를 추가합니다 (idempotent).

```sh
npm run migrate:user-id
```

마이그레이션 이후 기존 `userId == null`인 task는 어떤 사용자에게도 노출되지 않습니다. 새 사용자가 로그인해 새로 만든 task만 본인 화면에 보입니다.

## 4. 동작 확인

```sh
npm run dev
```

- `http://localhost:3000` 접속 → 우상단 **GitHub으로 로그인** 버튼 클릭
- GitHub authorize 화면에서 권한 부여
- 콜백 후 대시보드로 돌아오면 우상단에 본인 avatar + username이 표시됨
- **할 일 보드** 섹션이 비로그인 시 "로그인이 필요합니다" 안내로 대체됨을 확인
- 로그인 상태에서만 할 일 CRUD가 가능하고, 본인 할 일만 보이는지 확인

## 5. 배포 시 추가 단계

운영 환경에 배포한다면:

- 새 OAuth App을 별도로 만들어 운영 도메인용 `Authorization callback URL`을 등록
  (예: `https://your-domain.com/auth/github/callback`)
- 운영 환경 변수에 운영용 `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `MONGODB_URI` 주입
- `NODE_ENV=production`일 때 세션 쿠키는 자동으로 `secure: true` (HTTPS 필수)

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| 로그인 버튼 클릭 → `Error: GITHUB_CLIENT_ID ... 환경 변수가 설정되지 않았습니다` | `.env`에 값이 비어 있음. 채워 넣고 `npm run dev` 재시작 |
| 콜백에서 `state 가 일치하지 않습니다` | 쿠키가 차단된 브라우저 모드. 일반 창에서 다시 시도 |
| 콜백에서 `GitHub 토큰 교환 실패: 401` | Client Secret 오타 또는 OAuth App 삭제됨. Atlas Developer Settings에서 확인 |
| 콜백 후에도 미로그인 상태 | `MONGODB_URI` 미설정 또는 DB 접근 실패. 콘솔 로그 확인 |
| 할 일 보드가 "로그인이 필요합니다"로 계속 표시 | `/api/me`가 401 반환 → 세션 쿠키 누락. 다시 로그인 시도 |
