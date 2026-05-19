import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "할 일 + 계획 관리 앱",
  description: "ch05 실습 — 할 일과 주간 계획, 1년 목표를 연결하는 단일 페이지 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
