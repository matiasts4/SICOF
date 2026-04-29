"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAreaMeta, primarySpaces, resolveArea, workspaceCollections } from "@/lib/sicof-navigation";
import { cn } from "@/lib/utils";

function isPrimaryActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isWorkspaceActive(pathname: string, href: string) {
  if (href === pathname) return true;
  return pathname.startsWith(`${href}/`);
}

export function FloatingNavbar() {
  const pathname = usePathname();
  const area = resolveArea(pathname);
  const areaMeta = getAreaMeta(area);
  const workspaceLinks = area === "home" ? [] : workspaceCollections[area].links;
  const isHome = area === "home";
  const [scrolled, setScrolled] = useState(false);
  const [menuOriginPath, setMenuOriginPath] = useState<string | null>(null);
  const menuOpen = menuOriginPath === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4 lg:px-10">
        <header
          className={cn(
            "w-full max-w-[1000px] rounded-[999px] border px-3 py-2.5 sm:px-4",
            scrolled
              ? "border-white/20 bg-[rgba(11,14,21,0.9)] shadow-[0_18px_52px_rgba(0,0,0,0.38)] backdrop-blur-[28px]"
              : "border-white/12 bg-[rgba(13,16,24,0.68)] shadow-[0_10px_30px_rgba(0,0,0,0.26)] backdrop-blur-[22px]",
          )}
          style={{ transition: "background-color 240ms var(--ease-out-quart), border-color 240ms var(--ease-out-quart), box-shadow 240ms var(--ease-out-quart), transform 240ms var(--ease-out-quart)" }}
        >
          <nav className="flex min-h-[52px] items-center gap-3" aria-label="Principal">
            <Link href="/" className="flex shrink-0 items-center gap-3 rounded-full px-1.5 py-1">
              <span className="flex size-9 items-center justify-center rounded-[14px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                S
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="font-display text-sm font-semibold tracking-[0.12em] text-[var(--text-primary)]">SICOF</p>
                <p className="text-xs leading-5 text-[var(--text-muted)]">Centro de control de flotas</p>
              </div>
            </Link>

            <ul className="hidden flex-1 items-center justify-center gap-1 md:flex" role="list">
              {primarySpaces.map((link) => {
                const active = isPrimaryActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-sm font-semibold tracking-[0.01em] transition-[transform,background-color,color,box-shadow] duration-200",
                        active
                          ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,244,252,0.95))] !text-zinc-950 shadow-[0_10px_26px_rgba(0,0,0,0.2)]"
                          : "text-[var(--text-secondary)] hover:bg-white/[0.08] hover:text-[var(--text-primary)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="ml-auto hidden items-center gap-2 md:flex">
              <Link
                href="/terminal"
                className="btn btn-primary btn-sm"
              >
                Ir al Dashboard
              </Link>
            </div>

            <button
              type="button"
              className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-slate-50 transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.11] md:hidden"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOriginPath(menuOpen ? null : pathname)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </header>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 bg-[rgba(9,10,13,0.94)] px-5 pb-10 pt-28 backdrop-blur-2xl lg:hidden">
          <Reveal className="mx-auto flex h-full max-w-3xl flex-col rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.38)]">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <p className="section-label text-[0.68rem]">{areaMeta.kicker}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{areaMeta.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {areaMeta.context.map((item) => (
                  <StatusBadge key={item.label} label={item.label} tone={item.tone} />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="section-label text-xs">Espacios principales</p>
              <ul className="mt-3 flex flex-col gap-2" role="list">
                {primarySpaces.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOriginPath(null)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-4 text-base font-semibold transition-[transform,background-color,border-color,color] duration-200",
                        isPrimaryActive(pathname, link.href)
                          ? "border-white/16 bg-white !text-zinc-950"
                          : "border-white/8 bg-white/[0.03] text-slate-100 hover:-translate-y-0.5 hover:bg-white/[0.06]",
                      )}
                    >
                      <span>
                        <span className="block">{link.label}</span>
                        <span className={cn("mt-1 block text-sm", isPrimaryActive(pathname, link.href) ? "text-slate-700" : "text-[var(--text-muted)]")}>
                          {link.description}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {workspaceLinks.length > 0 ? (
              <div className="mt-6 flex-1 overflow-y-auto">
                <p className="section-label text-xs">Módulos del workspace</p>
                <ul className="mt-3 flex flex-col gap-2" role="list">
                  {workspaceLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOriginPath(null)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-base font-semibold text-slate-100 transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06]",
                          isWorkspaceActive(pathname, link.href) ? "border-white/14 bg-white/[0.08]" : "",
                        )}
                      >
                        <span>
                          <span className="block">{link.label}</span>
                          <span className="mt-1 block text-sm text-[var(--text-muted)]">{link.description}</span>
                        </span>
                        <StatusBadge label={link.tag ?? "Ruta"} tone={link.tone} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <Link
              href="/terminal"
              onClick={() => setMenuOriginPath(null)}
              className="btn btn-primary mt-6"
            >
              Ir al Dashboard
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      ) : null}
    </>
  );
}
