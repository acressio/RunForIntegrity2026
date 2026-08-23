"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseTabs = [
  { href: "/dashboard/input-activity", label: "Input Activity" },
  { href: "/dashboard/leaderboard", label: "Leaderboard" },
  { href: "/dashboard/race-statistics", label: "Race Statistics" },
];

export default function NavTabs({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = isAdmin
    ? [...baseTabs, { href: "/dashboard/admin", label: "Admin" }]
    : baseTabs;

  return (
    <nav className="flex gap-8 border-b border-line px-6">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tab-link ${active ? "tab-link-active" : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
