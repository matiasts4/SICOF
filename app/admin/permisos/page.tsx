"use client";

import { useEffect, useState } from "react";
import {
  KeyRound, Layers3, ShieldCheck, Waypoints,
  Loader2, Check, X, RefreshCw, AlertCircle, CheckCircle2
} from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";

const icons = [ShieldCheck, Layers3, Waypoints, KeyRound];

interface PermissionDetail {
  nombre: string;
  descripcion: string;
  roles: string[];
  id_permiso?: number;
}

type PermissionsMatrix = Record<string, PermissionDetail>;

interface PermisoFlat {
  id_permiso: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

interface SessionLog {
  accion: "GRANT" | "REVOKE";
  mensaje: string;
  ts: string;
}

const ROLES = ["Despachador", "Admin COF", "Admin TI"];

export default function AdminPermissionsPage() {
  const [matrix, setMatrix] = useState<PermissionsMatrix>({});
  const [permisosFlat, setPermisosFlat] = useState<PermisoFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null); // "rol::id_permiso"
  const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);

  const authHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sicof_token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const getActorUsername = (): string => {
    try {
      const stored = localStorage.getItem("sicof_user");
      if (stored) return JSON.parse(stored).username ?? "admin_ti";
    } catch {}
    return "admin_ti";
  };

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar matriz y permisos planos en paralelo
      const [resMatrix, resPermisos] = await Promise.all([
        fetch("/api/admin?action=get_permissions_matrix").then(r => r.json()),
        fetch("/api/admin?action=list_permisos").then(r => r.json()),
      ]);

      if (resMatrix.status === "ok") {
        setMatrix(resMatrix.data);
      } else {
        setError(resMatrix.message || "Error al cargar permisos");
      }

      if (resPermisos.status === "ok") {
        setPermisosFlat(resPermisos.data || []);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const hasPermission = (permCode: string, role: string) =>
    matrix[permCode]?.roles.includes(role);

  const getIdPermiso = (permCode: string): number | null => {
    const found = permisosFlat.find(p => p.codigo === permCode);
    return found?.id_permiso ?? null;
  };

  // ── Toggle de permiso ────────────────────────────────────────────────────────
  const handleTogglePermiso = async (permCode: string, rol: string) => {
    const id_permiso = getIdPermiso(permCode);
    if (!id_permiso) return;

    const key = `${rol}::${id_permiso}`;
    setToggling(key);

    // Actualización optimista inmediata
    const currentlyGranted = hasPermission(permCode, rol);
    setMatrix(prev => {
      const updated = { ...prev };
      const entry = { ...updated[permCode] };
      if (currentlyGranted) {
        entry.roles = entry.roles.filter(r => r !== rol);
      } else {
        entry.roles = [...entry.roles, rol];
      }
      updated[permCode] = entry;
      return updated;
    });

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          action: "toggle_rol_permiso",
          params: {
            rol,
            id_permiso,
            username_actor: getActorUsername(),
          },
        }),
      }).then(r => r.json());

      if (res.status === "ok") {
        const accion: "GRANT" | "REVOKE" = res.granted ? "GRANT" : "REVOKE";
        setSessionLog(prev => [
          {
            accion,
            mensaje: res.message,
            ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          },
          ...prev.slice(0, 19), // Máximo 20 entradas
        ]);
      } else {
        // Revertir cambio optimista si hubo error
        setMatrix(prev => {
          const updated = { ...prev };
          const entry = { ...updated[permCode] };
          if (currentlyGranted) {
            entry.roles = [...entry.roles, rol];
          } else {
            entry.roles = entry.roles.filter(r => r !== rol);
          }
          updated[permCode] = entry;
          return updated;
        });
        setSessionLog(prev => [
          {
            accion: "REVOKE",
            mensaje: `Error: ${res.message}`,
            ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          },
          ...prev.slice(0, 19),
        ]);
      }
    } catch {
      // Revertir
      await fetchMatrix();
    } finally {
      setToggling(null);
    }
  };

  // ── Métricas dinámicas ───────────────────────────────────────────────────────
  const dynamicMetrics = [
    { label: "Permisos del sistema", value: String(Object.keys(matrix).length), detail: "Acciones protegidas por guardias.", tone: "blue" as const },
    { label: "Perfiles activos", value: String(ROLES.length), detail: "Roles configurados en RBAC.", tone: "green" as const },
    { label: "Cambios en sesión", value: String(sessionLog.length), detail: "Toggles aplicados sin recargar.", tone: sessionLog.length > 0 ? "orange" as const : "green" as const },
    { label: "Validación de token", value: "JWT", detail: "Verificación de firmas criptográficas.", tone: "blue" as const },
  ];

  return (
    <main>
      <PageIntro
        badge="TI · Permisos"
        title="Matriz de Perfiles y Permisos"
        description="Visualización y control interactivo de la matriz de autorización (RBAC). Haz clic en cualquier celda para asignar o revocar un permiso a un rol."
        tone="green"
        tags={["RBAC visual", "Scope guard", "Edición en vivo"]}
        actions={
          <>
            <button
              onClick={fetchMatrix}
              disabled={loading}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Sincronizar Permisos
            </button>
          </>
        }
      />

      <WorkspaceMetricGrid items={dynamicMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">

          {/* ── Matriz de permisos ───────────────────────────────────────────── */}
          <Panel
            eyebrow="Matriz de alcance"
            title="Qué ve y qué hace cada perfil en tiempo real"
            description="Haz clic en ✓ o ✗ para asignar o revocar el permiso de ese rol instantáneamente."
          >
            {loading ? (
              <div className="flex h-48 items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <span className="text-slate-400">Consultando permisos...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/4 p-6 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium pl-4">Permiso</th>
                      <th className="pb-2 pr-4 font-medium">Descripción</th>
                      {ROLES.map(role => (
                        <th key={role} className="pb-2 pr-4 font-medium text-center">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(matrix).map(([code, p]) => (
                      <tr key={code} className="bg-white/4">
                        <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-semibold text-slate-200">
                          {p.nombre}
                          <span className="block text-[10px] font-mono text-slate-500 mt-0.5">{code}</span>
                        </td>
                        <td className="border-y border-white/8 px-4 py-3 text-slate-400 text-xs max-w-xs">
                          {p.descripcion}
                        </td>
                        {ROLES.map(role => {
                          const allowed = hasPermission(code, role);
                          const id_permiso = getIdPermiso(code);
                          const key = `${role}::${id_permiso}`;
                          const isToggling = toggling === key;

                          return (
                            <td key={role} className="border-y border-white/8 px-4 py-3 text-center last:rounded-r-2xl last:border-r">
                              <button
                                id={`perm-toggle-${code.replace(/\./g, "-")}-${role.replace(/\s/g, "_")}`}
                                onClick={() => handleTogglePermiso(code, role)}
                                disabled={isToggling || !id_permiso}
                                title={allowed ? `Quitar permiso '${p.nombre}' de ${role}` : `Asignar permiso '${p.nombre}' a ${role}`}
                                className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60
                                  ${allowed
                                    ? "border-green-500/40 bg-green-500/15 text-green-400 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-400"
                                    : "border-red-500/30 bg-red-500/10 text-red-400 hover:border-green-500/40 hover:bg-green-500/15 hover:text-green-400"
                                  }`}
                              >
                                {isToggling ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : allowed ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* ── Log de cambios de sesión ──────────────────────────────────────── */}
          <Panel
            eyebrow="Log de sesión"
            title="Cambios aplicados en esta sesión"
            description="Registro cronológico de asignaciones y revocaciones de permisos realizadas en tiempo real."
          >
            {sessionLog.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <ShieldCheck className="h-10 w-10 text-slate-600" />
                <p className="text-sm text-slate-500">
                  Sin cambios aún. Haz clic en una celda de la matriz para asignar o revocar un permiso.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {sessionLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition-all
                      ${log.accion === "GRANT"
                        ? "border-green-500/20 bg-green-500/5"
                        : log.mensaje.startsWith("Error")
                          ? "border-red-500/20 bg-red-500/5"
                          : "border-slate-500/20 bg-slate-500/5"
                      }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {log.accion === "GRANT" && !log.mensaje.startsWith("Error") ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge
                          label={log.accion === "GRANT" ? "Asignado" : "Revocado"}
                          tone={log.accion === "GRANT" ? "green" : "slate"}
                        />
                        <span className="font-mono text-[10px] text-slate-500">{log.ts}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{log.mensaje}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>
    </main>
  );
}
