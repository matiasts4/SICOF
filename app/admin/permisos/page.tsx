"use client";

import { useEffect, useState } from "react";
import { KeyRound, Layers3, ShieldCheck, Waypoints, Loader2, Check, X, RefreshCw } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { pendingPermissionChanges } from "@/lib/sicof-screen-data";

const icons = [ShieldCheck, Layers3, Waypoints, KeyRound];

interface PermissionDetail {
  nombre: string;
  descripcion: string;
  roles: string[];
}

type PermissionsMatrix = Record<string, PermissionDetail>;

export default function AdminPermissionsPage() {
  const [matrix, setMatrix] = useState<PermissionsMatrix>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin?action=get_permissions_matrix");
      const json = await res.json();
      if (json.status === "ok") {
        setMatrix(json.data);
      } else {
        setError(json.message || "Error al cargar permisos");
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

  const roles = ["Despachador", "Admin COF", "Admin TI"];

  const hasPermission = (permCode: string, role: string) => {
    return matrix[permCode]?.roles.includes(role);
  };

  // Métricas dinámicas
  const dynamicMetrics = [
    { label: "Permisos del sistema", value: String(Object.keys(matrix).length), detail: "Acciones protegidas por guardias.", tone: "blue" as const },
    { label: "Perfiles activos", value: String(roles.length), detail: "Roles configurados en RBAC.", tone: "green" as const },
    { label: "Matriz de alcance", value: "Sincronizada", detail: "Control de acceso real por SOA.", tone: "green" as const },
    { label: "Validación de token", value: "JWT", detail: "Verificación de firmas criptográficas.", tone: "blue" as const }
  ];

  return (
    <main>
      <PageIntro
        badge="TI · Permisos"
        title="Matriz de Perfiles y Permisos"
        description="Visualización y control de la matriz de autorización (RBAC) y roles definidos en la base de datos central de SICOF."
        tone="green"
        tags={["RBAC visual", "Scope guard"]}
        actions={
          <>
            <button
              onClick={fetchMatrix}
              disabled={loading}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar Permisos
            </button>
          </>
        }
      />

      <WorkspaceMetricGrid items={dynamicMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel
            eyebrow="Matriz de alcance"
            title="Qué ve y qué hace cada perfil en tiempo real"
            description="La cruz entre rol y código de permiso rige la autorización del API Gateway de SICOF."
          >
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <span className="ml-2 text-slate-400">Consultando permisos...</span>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/4 p-6 text-center text-red-400">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium pl-4">Permiso</th>
                      <th className="pb-2 pr-4 font-medium">Descripción</th>
                      {roles.map(role => (
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
                        {roles.map(role => {
                          const allowed = hasPermission(code, role);
                          return (
                            <td key={role} className="border-y border-white/8 px-4 py-3 text-center">
                              <span className="inline-flex justify-center items-center">
                                {allowed ? (
                                  <span className="h-6 w-6 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center">
                                    <Check className="h-4 w-4" />
                                  </span>
                                ) : (
                                  <span className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                                    <X className="h-4 w-4" />
                                  </span>
                                )}
                              </span>
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

          <Panel
            eyebrow="Cambios pendientes"
            title="Ajustes de permisos bajo revisión"
            description="Control de cambios en la matriz de acceso pendientes de aprobación por la dirección TI."
          >
            <div className="space-y-3">
              {pendingPermissionChanges.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Cambio {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

