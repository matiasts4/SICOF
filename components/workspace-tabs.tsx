"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { WorkspaceLink } from "@/lib/sicof-navigation";

type WorkspaceTabsProps = {
  items: WorkspaceLink[];
};

function isCurrent(pathname: string, href: string) {
  if (href === pathname) return true;
  if (href !== "/terminal" && href !== "/cof" && href !== "/admin") {
    return pathname.startsWith(href);
  }

  return pathname === href;
}

export function WorkspaceTabs({ items }: WorkspaceTabsProps) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto pb-1">
      <nav className="flex min-w-max gap-2 rounded-[24px] border border-white/8 bg-white/[0.03] p-1.5 backdrop-blur-xl" aria-label="Navegación del workspace">
        {items.map((item) => {
          const active = isCurrent(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 py-2.5 text-sm font-semibold tracking-[0.01em] transition-[transform,background-color,border-color,color,box-shadow] duration-200",
                active
                  ? "border-white/16 bg-white !text-zinc-950 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                  : "border-transparent bg-transparent text-[var(--text-secondary)] hover:-translate-y-0.5 hover:border-white/8 hover:bg-white/[0.05] hover:text-[var(--text-primary)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
