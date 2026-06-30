/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  MonitorDot, ShieldCheck, UserRound, Users, RefreshCw,
  UserPlus, X, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { Portal } from "@/components/ui/portal";
import {
  activeSessions as mockActiveSessions,
  adminUserMetrics as mockUserMetrics,
  userRoster as mockUserRoster,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [Users, MonitorDot, ShieldCheck, UserRound];

const TERMINALES = [
  { id: null,  label: "Acceso Global (COF)" },
  { id: 1,     label: "Terminal El Roble" },
  { id: 2,     label: "Terminal Colo Colo" },
  { id: 3,     label: "Terminal El Salto" },
  { id: 4,     label: "Terminal Lo Echevers" },
  { id: 5,     label: "Terminal José Arrieta" },
  { id: 6,     label: "Terminal María Angélica" },
];

const ROLES = ["Despachador", "Admin COF", "Admin TI"];

function scopeFromTerminal(id_terminal: number | null): string {
  return TERMINALES.find((t) => t.id === id_terminal)?.label ?? "Acceso Global (COF)";
}

type ToastType = "success" | "error";

interface Toast {
  type: ToastType;
  message: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Formulario nuevo usuario
  const [form, setForm] = useState({
    username: "", nombre: "", password: "", rol: "Despachador", id_terminal: "" as string | number
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const authHeaders = () => {
    const token = localStorage.getItem("sicof_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Obtener username del actor autenticado
  const getActorUsername = (): string => {
    try {
      const stored = localStorage.getItem("sicof_user");
      if (stored) return JSON.parse(stored).username ?? "admin_ti";
    } catch {}
    return "admin_ti";
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_users", params: {} })
      }).then(r => r.json());

      if (res.status === "ok") {
        setUsers(res.data || []);
        setIsRealData(true);
      } else {
        setIsRealData(false);
      }
    } catch (err) {
      console.warn("Backend offline for admin/users page, using mock fallback:", err);
      setIsRealData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Suspender / Restaurar ────────────────────────────────────────────────────
  const handleToggleUser = async (user: any) => {
    setTogglingId(user.id_usuario);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          action: "delete_user",
          params: {
            id_usuario: user.id_usuario,
            username_actor: getActorUsername(),
          },
        }),
      }).then(r => r.json());

      if (res.status === "ok") {
        showToast("success", res.message);
        // Actualizar estado local optimistamente
        setUsers(prev =>
          prev.map(u =>
            u.id_usuario === user.id_usuario
              ? { ...u, activo: res.nuevo_activo }
              : u
          )
        );
      } else {
        showToast("error", res.message || "Error al actualizar usuario");
      }
    } catch {
      showToast("error", "Error de comunicación con el servidor");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Crear usuario ────────────────────────────────────────────────────────────
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const params: any = {
        new_username: form.username.trim(),
        nombre: form.nombre.trim(),
        password: form.password,
        rol: form.rol,
        username_actor: getActorUsername(),
      };
      if (form.id_terminal !== "" && form.id_terminal !== null) {
        params.id_terminal = Number(form.id_terminal);
      }

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ action: "create_user", params }),
      }).then(r => r.json());

      if (res.status === "ok") {
        setShowModal(false);
        setForm({ username: "", nombre: "", password: "", rol: "Despachador", id_terminal: "" });
        showToast("success", res.message);
        await fetchData();
      } else {
        setFormError(res.message || "Error al crear usuario");
      }
    } catch {
      setFormError("Error de comunicación con el servidor");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Computar métricas y roster ───────────────────────────────────────────────
  let displayUserMetrics = mockUserMetrics;
  let displayUserRoster = mockUserRoster;
  let displayActiveSessions = mockActiveSessions;

  if (isRealData) {
    const totalUsers = users.length;
    const activeCount = users.filter(u => u.activo === 1).length;
    const adminCount = users.filter(u => u.rol === "Admin TI" || u.rol === "Admin COF").length;
    const dispatcherCount = users.filter(u => u.rol === "Despachador").length;

    displayUserMetrics = [
      { label: "Usuarios del roster", value: String(totalUsers).padStart(2, "0"), detail: "Registrados en base de datos", tone: "blue" as Tone },
      { label: "Cuentas activas", value: String(activeCount).padStart(2, "0"), detail: "Habilitadas para loguearse", tone: "green" as Tone },
      { label: "Administradores", value: String(adminCount).padStart(2, "0"), detail: "COF y TI con privilegios", tone: "orange" as Tone },
      { label: "Despachadores", value: String(dispatcherCount).padStart(2, "0"), detail: "Operadores en terminales", tone: "slate" as Tone },
    ];

    displayActiveSessions = users.slice(0, 3).map((u) => ({
      title: u.nombre,
      detail: `Usuario ${u.username} con rol ${u.rol} y alcance de ${u.id_terminal ? "Terminal" : "COF global"} listo para operar.`,
      tone: "green" as Tone
    }));
  }

  return (
    <main>
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-xl backdrop-blur-sm transition-all
            ${toast.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
        >
          {toast.type === "success"
            ? <CheckCircle2 className="h-5 w-5 shrink-0" />
            : <AlertCircle className="h-5 w-5 shrink-0" />
          }
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <PageIntro
        badge={`TI · Usuarios · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="Gestión de Usuarios y Sesiones Activas"
        description="Supervisión de perfiles de usuario, roles asignados, alcances geográficos de control y estado de sesiones en tiempo real."
        tone="blue"
        tags={["Perfiles", "Sesiones activas"]}
        actions={
          <>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Usuario
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-secondary cursor-pointer gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Sincronizar
            </button>
          </>
        }
      />

      <WorkspaceMetricGrid items={displayUserMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
          <Panel
            eyebrow="Roster de acceso"
            title="Perfiles que hoy pisan el sistema"
            description="Consolidado de usuarios registrados en el sistema con indicación de rol, alcance de terminal y estado de cuenta."
          >
            {loading ? (
              <div className="flex h-48 items-center justify-center gap-3 text-slate-400 font-mono text-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando roster de usuarios...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium">Usuario</th>
                      <th className="pb-2 pr-4 font-medium">Rol</th>
                      <th className="pb-2 pr-4 font-medium">Scope</th>
                      <th className="pb-2 pr-4 font-medium">Estado</th>
                      <th className="pb-2 pr-4 font-medium">Username</th>
                      {isRealData && <th className="pb-2 font-medium text-center">Acción</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(isRealData ? users : mockUserRoster.map((r, i) => ({
                      id_usuario: i,
                      nombre: r.name,
                      rol: r.role,
                      id_terminal: null,
                      activo: r.session === "Activo" ? 1 : 0,
                      username: r.note.replace("username: ", ""),
                    }))).map((user: any, idx: number) => {
                      const scope = scopeFromTerminal(user.id_terminal);
                      const isActive = user.activo === 1;
                      const isToggling = togglingId === user.id_usuario;
                      return (
                        <tr key={`${user.id_usuario ?? user.nombre}-${idx}`} className="bg-white/4">
                          <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">
                            {user.nombre}
                          </td>
                          <td className="border-y border-white/8 px-4 py-3">{user.rol}</td>
                          <td className="border-y border-white/8 px-4 py-3 text-slate-400 text-xs">{scope}</td>
                          <td className="border-y border-white/8 px-4 py-3">
                            <StatusBadge label={isActive ? "Activo" : "Suspendido"} tone={isActive ? "green" : "slate"} />
                          </td>
                          <td className="border-y border-white/8 px-4 py-3 font-mono text-xs text-slate-400">
                            {user.username}
                          </td>
                          {isRealData && (
                            <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3 text-center">
                              <button
                                id={`toggle-user-${user.id_usuario}`}
                                onClick={() => handleToggleUser(user)}
                                disabled={isToggling}
                                className={`cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50
                                  ${isActive
                                    ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    : "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                  }`}
                              >
                                {isToggling ? (
                                  <Loader2 className="h-3 w-3 animate-spin inline" />
                                ) : isActive ? "Suspender" : "Restaurar"}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Sesiones relevantes"
            title="Lo que TI mira sin entrar todavía al detalle técnico"
            description="Resumen de sesiones activas validadas y estado de acceso de operadores al sistema."
          >
            {loading ? (
              <div className="flex h-48 items-center justify-center gap-3 text-slate-400 font-mono text-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando sesiones...
              </div>
            ) : (
              <div className="space-y-3">
                {displayActiveSessions.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                      <StatusBadge label="Sesión válida" tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>

      {/* ── Modal Crear Usuario ────────────────────────────────────────────────── */}
      {showModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowModal(false); setFormError(null); }}
            />
            {/* Panel */}
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1117] p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-blue-400">
                    TI · Admin
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-100">Crear Nuevo Usuario</h2>
                </div>
                <button
                  onClick={() => { setShowModal(false); setFormError(null); }}
                  className="cursor-pointer rounded-xl p-2 text-slate-400 hover:bg-white/8 hover:text-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Nombre Completo
                  </label>
                  <input
                    id="new-user-nombre"
                    type="text"
                    required
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: María González"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none ring-0 transition focus:border-blue-500/50 focus:bg-white/8"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Username
                  </label>
                  <input
                    id="new-user-username"
                    type="text"
                    required
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, "_") }))}
                    placeholder="Ej: m.gonzalez"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-blue-500/50 focus:bg-white/8"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Contraseña inicial
                  </label>
                  <input
                    id="new-user-password"
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-blue-500/50 focus:bg-white/8"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Rol
                  </label>
                  <select
                    id="new-user-rol"
                    value={form.rol}
                    onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                    className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500/50"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Terminal */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Terminal de acceso
                  </label>
                  <select
                    id="new-user-terminal"
                    value={form.id_terminal === null ? "" : String(form.id_terminal)}
                    onChange={e => setForm(f => ({ ...f, id_terminal: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="w-full cursor-pointer rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500/50"
                  >
                    {TERMINALES.map(t => (
                      <option key={String(t.id)} value={t.id === null ? "" : String(t.id)}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setFormError(null); }}
                    className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/8"
                  >
                    Cancelar
                  </button>
                  <button
                    id="submit-create-user"
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    {formLoading ? "Creando..." : "Crear Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </main>
  );
}
