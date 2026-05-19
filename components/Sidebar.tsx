"use client";

interface NavItem {
  href: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: "#dashboard", label: "대시보드" },
  { href: "#goals", label: "1년 목표" },
  { href: "#weekly", label: "주간 계획" },
  { href: "#tasks", label: "할 일" },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-48 shrink-0 border-r border-gray-200 bg-white p-4 md:block">
      <div className="mb-4 px-3 py-2">
        <p className="text-xs font-semibold text-gray-500">계획 관리</p>
      </div>
      <nav className="space-y-1">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
