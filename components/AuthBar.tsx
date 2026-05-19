"use client";

import type { User } from "@/lib/types";

interface Props {
  user: User | null;
  mounted: boolean;
}

export default function AuthBar({ user, mounted }: Props) {
  if (!mounted) {
    return <div className="h-9" />;
  }

  if (!user) {
    return (
      <a
        href="/auth/github"
        className="inline-flex items-center gap-2 rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.42 7.88 10.94.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.4.99.01 1.98.14 2.9.4 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.7.41.36.78 1.06.78 2.13v3.16c0 .31.21.66.8.55C20.2 21.42 23.5 17.1 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
        </svg>
        GitHub으로 로그인
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={user.avatarUrl}
        alt={user.username}
        className="h-7 w-7 rounded-full border border-gray-200"
      />
      <span className="truncate text-sm font-medium" title={user.username}>
        {user.username}
      </span>
      <form action="/auth/logout" method="POST">
        <button
          type="submit"
          className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
