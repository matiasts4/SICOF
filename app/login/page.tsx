/* eslint-disable */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, User, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          params: { username, password },
        }),
      });

      const data = await res.json();

      if (data.status === "ok" && data.token) {
        localStorage.setItem("sicof_token", data.token);
        localStorage.setItem("sicof_user", JSON.stringify(data.user));

        // Redirigir según el rol
        const role = data.user.rol;
        if (role === "Despachador") {
          router.push("/terminal");
        } else if (role === "Admin COF") {
          router.push("/cof");
        } else if (role === "Admin TI") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("No se pudo conectar con el servicio de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/8 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/14 bg-gradient-to-b from-white/10 to-white/2 text-white shadow-inner">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white font-display">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sistema Integral de Control de Flotas (SICOF)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Usuario
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-slate-500 focus:border-blue-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:text-sm"
                  placeholder="Ej: cpizarro"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contraseña
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:border-blue-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
              Conexión SOA en vivo (TCP puerto 5000)
            </span>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg cursor-pointer"
            >
              {loading ? "Autenticando..." : "Ingresar al Workspace"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-400">
          <p className="font-semibold text-white mb-1">Usuarios de prueba:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><span className="text-slate-300">cpizarro</span> (Despachador - El Roble)</li>
            <li><span className="text-slate-300">pvera</span> (Admin COF - Global)</li>
            <li><span className="text-slate-300">imella</span> / <span className="text-slate-300">admin</span> (Admin TI)</li>
          </ul>
          <p className="mt-2 text-[10px] text-slate-500">Contraseña universal: <span className="text-slate-400">sicof2026</span></p>
        </div>
      </div>
    </div>
  );
}
