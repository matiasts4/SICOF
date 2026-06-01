/* eslint-disable */
"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";
import { FloatingNavbar } from "@/components/floating-navbar";
import { Sidebar } from "@/components/sidebar";
import { resolveArea } from "@/lib/sicof-navigation";
import { DotPattern } from "@/components/ui/dot-pattern";

export function MainLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const area = resolveArea(pathname);
  const isWorkspace = area === "terminal" || area === "cof" || area === "admin";

  const [isPending, setIsPending] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsPending(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsPending(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname, children]);

  if (isWorkspace) {
    return (
      <div className="flex min-h-screen w-full workspace-layout">
        <Sidebar />
        <div className="flex-1 w-full md:pl-[280px] transition-all duration-300">
          <main className="min-h-screen w-full py-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto relative">
            <div className={`page-loader-overlay ${isPending ? "is-visible" : ""}`}>
              <div className="spinner-glow">
                <div className="spinner-pulse" />
                <div className="spinner-ring" />
              </div>
              <span className="mt-4 text-xs font-mono tracking-widest text-slate-500 uppercase">Cargando Módulo...</span>
            </div>

            <div className={`page-transition-container ${isPending ? "is-pending" : ""}`}>
              {displayChildren}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Si es la página principal / o login, mantiene el layout original con FloatingNavbar
  const isLoginPage = pathname === "/login";

  return (
    <div className="relative min-h-screen pb-16 overflow-x-hidden">
      <DotPattern className="fill-white/20" />
      {!isLoginPage && <FloatingNavbar />}
      <div className={isLoginPage ? "relative z-10 min-h-screen" : "relative z-10 pt-20 sm:pt-24 xl:pt-28"}>
        {children}
      </div>
    </div>
  );
}

