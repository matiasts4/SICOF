"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/login", "/"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

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

          // Verificar coincidencia de ruta con rol
          if (pathname.startsWith("/terminal") && role !== "Despachador") {
            // Rol incorrecto para terminal
            setAuthorized(false);
            if (role === "Admin COF") router.push("/cof");
            else if (role === "Admin TI") router.push("/admin");
            else router.push("/");
          } else if (pathname.startsWith("/cof") && role !== "Admin COF") {
            // Rol incorrecto para COF
            setAuthorized(false);
            if (role === "Despachador") router.push("/terminal");
            else if (role === "Admin TI") router.push("/admin");
            else router.push("/");
          } else if (pathname.startsWith("/admin") && role !== "Admin TI") {
            // Rol incorrecto para admin TI
            setAuthorized(false);
            if (role === "Despachador") router.push("/terminal");
            else if (role === "Admin COF") router.push("/cof");
            else router.push("/");
          } else {
            // Todo correcto
            setAuthorized(true);
          }
        } else {
          // Token inválido, expirar sesión
          localStorage.removeItem("sicof_token");
          localStorage.removeItem("sicof_user");
          setAuthorized(false);
          if (!isPublicPath) {
            router.push("/login");
          } else {
            setAuthorized(true);
          }
        }
      } catch (err) {
        // Error de red, permitir continuar en offline-fallback si hay datos locales
        console.error("Auth validation failed, falling back to local storage session:", err);
        const localUser = JSON.parse(userStr);
        const role = localUser.rol;

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
