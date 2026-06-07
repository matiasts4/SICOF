"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePermissions, isRouteAllowed } from "@/lib/permissions-context";

const PUBLIC_PATHS = ["/login", "/"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setGrantedPerms } = usePermissions();

  // ── Función reutilizable para cargar permisos ──────────────────────────────
  const fetchAndApplyPermissions = useCallback(async (token: string, currentPath: string) => {
    try {
      const permRes = await fetch("/api/auth?action=get_my_permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 401 = cuenta suspendida o token inválido → cerrar sesión inmediatamente
      if (permRes.status === 401) {
        localStorage.removeItem("sicof_token");
        localStorage.removeItem("sicof_user");
        localStorage.removeItem("sicof_perms");
        router.push("/login?reason=suspended");
        return null;
      }

      const permData = await permRes.json();
      if (permData.status === "ok" && Array.isArray(permData.data)) {
        const newPerms: string[] = permData.data;
        setGrantedPerms(newPerms);
        localStorage.setItem("sicof_perms", JSON.stringify(newPerms));

        // Si el usuario está en una ruta que ya no tiene permiso, redirigir
        if (!isRouteAllowed(currentPath, newPerms)) {
          if (currentPath.startsWith("/terminal")) router.push("/terminal");
          else if (currentPath.startsWith("/cof")) router.push("/cof");
          else if (currentPath.startsWith("/admin")) router.push("/admin");
          else router.push("/");
        }
        return newPerms;
      }
    } catch {
      // Silencioso: error de red en polling no debe interrumpir la sesión
    }
    return null;
  }, [router, setGrantedPerms]);

  // ── Polling periódico: revalida sesión y permisos cada 15 segundos ─────────
  // Detecta suspensión de cuenta sin necesidad de que el usuario navegue.
  useEffect(() => {
    const token = localStorage.getItem("sicof_token");
    if (!token) return;

    const interval = setInterval(() => {
      fetchAndApplyPermissions(token, pathname);
    }, 15_000);

    return () => clearInterval(interval);
  }, [pathname, fetchAndApplyPermissions]);

  useEffect(() => {
    const checkAuth = async () => {
      const isPublicPath = PUBLIC_PATHS.includes(pathname);
      const token = localStorage.getItem("sicof_token");
      const userStr = localStorage.getItem("sicof_user");

      if (!token || !userStr) {
        if (!isPublicPath) {
          setAuthorized(false);
          setLoading(false);
          router.push("/login");
        } else {
          setAuthorized(true);
          setLoading(false);
        }
        return;
      }

      // Validar el token con el backend
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "validate",
            params: { token },
          }),
        });

        const data = await res.json();

        if (data.status === "ok" && data.user) {
          const user = data.user;
          const role = user.rol;

          // ── Cargar permisos del rol desde la matriz RBAC ──────────────────
          let rolePerms: string[] = [];
          try {
            const permRes = await fetch("/api/auth?action=get_my_permissions", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const permData = await permRes.json();
            if (permData.status === "ok" && Array.isArray(permData.data)) {
              rolePerms = permData.data;
            }
          } catch {
            // Si falla (red o sin token admin), permisos vacíos → se mostrarán todas las rutas
            // En offline, cargamos permisos por defecto desde localStorage si existen
            const cached = localStorage.getItem("sicof_perms");
            if (cached) {
              try { rolePerms = JSON.parse(cached); } catch {}
            }
          }
          // Persistir en localStorage para fallback offline
          localStorage.setItem("sicof_perms", JSON.stringify(rolePerms));
          setGrantedPerms(rolePerms);

          // ── Verificar coincidencia de ruta con rol ────────────────────────
          if (pathname.startsWith("/terminal") && role !== "Despachador") {
            setAuthorized(false);
            if (role === "Admin COF") router.push("/cof");
            else if (role === "Admin TI") router.push("/admin");
            else router.push("/");
          } else if (pathname.startsWith("/cof") && role !== "Admin COF") {
            setAuthorized(false);
            if (role === "Despachador") router.push("/terminal");
            else if (role === "Admin TI") router.push("/admin");
            else router.push("/");
          } else if (pathname.startsWith("/admin") && role !== "Admin TI") {
            setAuthorized(false);
            if (role === "Despachador") router.push("/terminal");
            else if (role === "Admin COF") router.push("/cof");
            else router.push("/");
          } else if (!isRouteAllowed(pathname, rolePerms)) {
            // ── Bloquear ruta protegida por permiso RBAC revocado ────────────
            setAuthorized(false);
            // Redirigir al hub del workspace actual
            if (pathname.startsWith("/terminal")) router.push("/terminal");
            else if (pathname.startsWith("/cof")) router.push("/cof");
            else if (pathname.startsWith("/admin")) router.push("/admin");
            else router.push("/");
          } else {
            // Todo correcto
            setAuthorized(true);
          }
        } else {
          // Token inválido, expirar sesión
          localStorage.removeItem("sicof_token");
          localStorage.removeItem("sicof_user");
          localStorage.removeItem("sicof_perms");
          setAuthorized(false);
          if (!isPublicPath) {
            router.push("/login");
          } else {
            setAuthorized(true);
          }
        }
      } catch (err) {
        // Error de red, fallback a sesión local
        console.error("Auth validation failed, falling back to local storage session:", err);
        const localUser = JSON.parse(userStr);
        const role = localUser.rol;

        // Recuperar permisos del caché local
        const cached = localStorage.getItem("sicof_perms");
        if (cached) {
          try { setGrantedPerms(JSON.parse(cached)); } catch {}
        }

        if (pathname.startsWith("/terminal") && role !== "Despachador") {
          setAuthorized(false);
          router.push("/terminal");
        } else if (pathname.startsWith("/cof") && role !== "Admin COF") {
          setAuthorized(false);
          router.push("/cof");
        } else if (pathname.startsWith("/admin") && role !== "Admin TI") {
          setAuthorized(false);
          router.push("/admin");
        } else {
          setAuthorized(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090d]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-400 font-mono">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
