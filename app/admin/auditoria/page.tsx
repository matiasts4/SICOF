"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, FileClock, ShieldCheck, TimerReset, Loader2, RefreshCw } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminAuditMetrics, auditHighlights } from "@/lib/sicof-screen-data";

const icons = [FileClock, AlertTriangle, TimerReset, ShieldCheck];

interface AuditLog {
  id_auditoria: number;
  username: string;
  accion: string;
  tabla_afectada: string;
  registro_id: number | null;
  detalles: string;
  fecha_hora: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin?action=get_audit_logs");
      const json = await res.json();
      if (json.status === "ok") {
        setLogs(json.data);
      } else {
        setError(json.message || "Error al cargar logs");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionTone = (action: string) => {
    switch (action.toUpperCase()) {
      case "LOGIN":
        return "green";
      case "CREATE":
        return "blue";
      case "UPDATE":
        return "orange";
      case "DELETE":
        return "red";
      default:
        return "slate";
    }
  };

  const formatTime = (isoString: string) => {
    try {
      // Intentar extraer la hora del ISO "YYYY-MM-DDTHH:MM:SS"
      if (isoString.includes("T")) {
        return isoString.split("T")[1].substring(0, 5);
      }
      return isoString.substring(11, 16) || isoString;
    } catch {
      return isoString;
    }
  };

  // Métricas dinámicas basadas en los logs reales
  const dynamicMetrics = [
    { label: "Eventos cargados", value: String(logs.length), detail: "Trazas recuperadas del backend.", tone: "blue" as const },
    { label: "Modificaciones", value: String(logs.filter(l => l.accion === "UPDATE").length), detail: "Ediciones de configuración.", tone: "orange" as const },
    { label: "Inicios de sesión", value: String(logs.filter(l => l.accion === "LOGIN").length), detail: "Accesos de usuarios al sistema.", tone: "green" as const },
    { label: "Modo real", value: "Activo", detail: "Datos directos de SQLite/SOA.", tone: "green" as const }
  ];

  return (
    <main>
      <PageIntro
        badge="TI · Auditoría"
        title="Registro de Auditoría de Sistemas"
        description="Registro histórico y trazabilidad de acciones críticas de usuarios, modificaciones de configuración e inicios de sesión."
        tone="orange"
        tags={["Auditoría", "Trazabilidad", "Eventos críticos"]}
        actions={
          <>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar Auditoría
            </button>
          </>
        }
      />

      <WorkspaceMetricGrid items={dynamicMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel
            eyebrow="Feed principal"
            title="Eventos recientes registrados en base de datos"
            description="Trazabilidad directa desde el bus TCP del servicio de seguridad ('segur')."
          >
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-slate-400">Consultando bus SOA...</span>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/4 p-6 text-center text-red-400">
                {error}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No hay logs registrados en la base de datos de auditoría.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium pl-4">Hora</th>
                      <th className="pb-2 pr-4 font-medium">Acción</th>
                      <th className="pb-2 pr-4 font-medium">Actor</th>
                      <th className="pb-2 pr-4 font-medium">Tabla</th>
                      <th className="pb-2 font-medium">Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((row) => (
                      <tr key={row.id_auditoria} className="bg-white/4">
                        <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">
                          {formatTime(row.fecha_hora)}
                        </td>
                        <td className="border-y border-white/8 px-4 py-3">
                          <StatusBadge label={row.accion} tone={getActionTone(row.accion)} />
                        </td>
                        <td className="border-y border-white/8 px-4 py-3 font-semibold text-slate-200">
                          {row.username}
                        </td>
                        <td className="border-y border-white/8 px-4 py-3 text-xs font-mono text-slate-400">
                          {row.tabla_afectada || "-"}
                        </td>
                        <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3 text-slate-300 max-w-xs truncate">
                          {row.detalles}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Hallazgos"
            title="Integración real verificada"
            description="Puntos destacados de control e integridad de datos reportados por el servicio de seguridad."
          >
            <div className="space-y-3">
              {auditHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                    <StatusBadge label="SOA Real" tone={item.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

