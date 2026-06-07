/* eslint-disable */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Bus, 
  ArrowUpDown, 
  Battery, 
  AlertTriangle, 
  Activity, 
  Users, 
  KeyRound, 
  Settings, 
  FileText, 
  FileSpreadsheet, 
  ArrowLeft,
  Terminal,
  Grid
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { workspaceCollections, resolveArea } from "@/lib/sicof-navigation";
import { usePermissions, isRouteAllowed } from "@/lib/permissions-context";

// Mapeo de íconos para cada link del workspace para dar una visual muy rica
const ICON_MAP: Record<string, any> = {
  "Resumen": LayoutDashboard,
  "Flota": Bus,
  "Despacho": ArrowUpDown,
  "Energía": Battery,
  "Frecuencia": Activity,
  "Incidentes": AlertTriangle,
  "Usuarios": Users,
  "Permisos": KeyRound,
  "Auditoría": Terminal,
  "Parámetros": Settings,
  "Reportes": FileText,
  "Terminales": Grid,
  "KPIs": FileSpreadsheet,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ nombre: string; rol: string; username: string } | null>(null);
  const { grantedPerms } = usePermissions();

  const area = resolveArea(pathname);
  const isWorkspace = area === "terminal" || area === "cof" || area === "admin";
  const workspace = isWorkspace ? workspaceCollections[area] : null;

  useEffect(() => {
    const userStr = localStorage.getItem("sicof_user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        setUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("sicof_token");
    localStorage.removeItem("sicof_user");
    document.cookie = "sicof_token=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  };

  if (!isWorkspace || !workspace) {
    return null;
  }

  const links = workspace.links;

  // Render para cada item de la lista de navegación
  const navigationItems = links.map((link) => {
    const isActive = pathname === link.href;
    const Icon = ICON_MAP[link.label] || LayoutDashboard;
    const allowed = isRouteAllowed(link.href, grantedPerms);

    if (!allowed) {
      // Mostrar el link deshabilitado con candado para comunicar la restricción
      return (
        <li key={link.href} className="relative">
          <span
            className="group flex items-center gap-3.5 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold opacity-35 cursor-not-allowed select-none"
            title={`Sin permiso para acceder a ${link.label}`}
          >
            <Icon className="h-[18px] w-[18px] text-slate-600" />
            <div className="flex-1 min-w-0">
              <span className="block truncate text-slate-600">{link.label}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        </li>
      );
    }

    return (
      <li key={link.href} className="relative">
        <Link
          href={link.href}
          onClick={() => setIsOpen(false)}
          className={cn(
            "group flex items-center gap-3.5 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold transition-all duration-200",
            isActive
              ? "border-white/10 bg-white/8 text-white shadow-[0_4px_20px_rgba(255,255,255,0.03)]"
              : "text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)] hover:border-white/[0.04]"
          )}
        >
          <Icon className={cn(
            "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105",
            isActive ? "text-brand" : "text-slate-400 group-hover:text-white"
          )} />
          <div className="flex-1 min-w-0">
            <span className="block truncate">{link.label}</span>
          </div>
          {isActive && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_rgba(159,184,255,0.8)]" />
          )}
        </Link>
      </li>
    );
  });

  return (
    <>
      {/* Botón flotante para menú móvil */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[rgba(13,16,24,0.85)] text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all hover:bg-white/[0.1]"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop del menú móvil */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar contenedor principal */}
      <aside
        className={cn(
          "fixed bottom-0 top-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/8 bg-[#090b10] px-5 py-6 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Encabezado / Logo */}
        <div className="flex flex-col gap-1.5 border-b border-white/8 pb-5 mb-5 mt-10 md:mt-0">
          <Link href="/" className="flex items-center gap-3 rounded-full hover:opacity-90">
            <span className="flex size-9 items-center justify-center rounded-[12px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              S
            </span>
            <div className="min-w-0">
              <span className="font-display text-sm font-semibold tracking-[0.12em] text-[var(--text-primary)]">SICOF</span>
              <span className="block text-[10px] leading-3 text-[var(--text-muted)] font-mono uppercase tracking-wider">{workspace.label}</span>
            </div>
          </Link>
        </div>

        {/* Retorno a Centro */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver al Centro</span>
        </Link>

        {/* Navegación del Workspace */}
        <nav className="flex-1 overflow-y-auto mb-6">
          <ul className="flex flex-col gap-1" role="list">
            {navigationItems}
          </ul>
        </nav>

        {/* Bloque de usuario e inicio de sesión */}
        <div className="border-t border-white/8 pt-5">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-1">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/12 border border-brand/20 text-brand font-bold text-sm">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{user.nombre}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{user.rol}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-sm font-semibold text-red-200 transition-all hover:bg-red-500/18 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary w-full text-center"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
