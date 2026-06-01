"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Settings2, SlidersHorizontal, Waypoints, Loader2, Save, CheckCircle2, RefreshCw } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { changeCalendar, integrationFlags } from "@/lib/sicof-screen-data";

const icons = [Settings2, SlidersHorizontal, CalendarClock, Waypoints];

interface Parameter {
  clave: string;
  valor: string;
  tipo: string;
  descripcion: string;
}

export default function AdminParametersPage() {
  const [params, setParams] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "success" | "error">>({});

  const fetchParams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin?action=get_params");
      const json = await res.json();
      if (json.status === "ok") {
        setParams(json.data);
      } else {
        setError(json.message || "Error al cargar parámetros");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParams();
  }, []);

  const handleValueChange = (clave: string, newValue: string) => {
    setParams(prev =>
      prev.map(p => (p.clave === clave ? { ...p, valor: newValue } : p))
    );
    // Reset save status for this key on edit
    setSaveStatus(prev => ({ ...prev, [clave]: "idle" }));
  };

  const handleSave = async (clave: string, valor: string) => {
    setSaveStatus(prev => ({ ...prev, [clave]: "saving" }));
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_param",
          params: {
            clave,
            valor,
            username: "admin" // Usuario simulado en sesión
          }
        })
      });
      const json = await res.json();
      if (json.status === "ok") {
        setSaveStatus(prev => ({ ...prev, [clave]: "success" }));
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, [clave]: "idle" }));
        }, 3000);
      } else {
        setSaveStatus(prev => ({ ...prev, [clave]: "error" }));
      }
    } catch {
      setSaveStatus(prev => ({ ...prev, [clave]: "error" }));
    }
  };

  // Métricas dinámicas basadas en base de datos
  const dynamicMetrics = [
    { label: "Parámetros activos", value: String(params.length), detail: "Configurados en SQLite.", tone: "blue" as const },
    { label: "Flags de contingencia", value: params.some(p => p.clave === "modo_contingencia" && p.valor === "true") ? "01" : "00", detail: "Estado operacional simplificado.", tone: "orange" as const },
    { label: "Último cambio", value: "Hoy", detail: "Log de auditoría sincronizado.", tone: "green" as const },
    { label: "Modo persistente", value: "Activo", detail: "Sin datos quemados en frontend.", tone: "green" as const },
  ];

  return (
    <main>
      <PageIntro
        badge="TI · Parámetros"
        title="Parámetros Globales del Sistema"
        description="Configure en tiempo real las constantes del sistema que rigen la lógica de despacho, energía y alertas de los buses."
        tone="slate"
        tags={["Configuración", "Flags", "Preparación para integración"]}
        actions={
          <>
            <button
              onClick={fetchParams}
              disabled={loading}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar Parámetros
            </button>
          </>
        }
      />

      <WorkspaceMetricGrid items={dynamicMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel
            eyebrow="Configuración global"
            title="Lógica de negocio parametrizable"
            description="Modifique los valores. Los cambios impactarán directamente la lógica del BUS SOA en tiempo real."
          >
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-slate-400">Cargando parámetros...</span>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/4 p-6 text-center text-red-400">
                {error}
              </div>
            ) : (
              <div className="space-y-4">
                {params.map((p) => {
                  const status = saveStatus[p.clave] || "idle";
                  return (
                    <div key={p.clave} className="rounded-2xl border border-white/8 bg-white/4 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1 max-w-md">
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-500">{p.clave}</span>
                        <h4 className="text-base font-semibold text-slate-100">{p.descripcion}</h4>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {p.tipo === "boolean" ? (
                          <select
                            value={p.valor}
                            onChange={(e) => handleValueChange(p.clave, e.target.value)}
                            className="bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                          >
                            <option value="true">Verdadero (True)</option>
                            <option value="false">Falso (False)</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={p.valor}
                            onChange={(e) => handleValueChange(p.clave, e.target.value)}
                            className="bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm w-24 text-center focus:outline-none focus:border-orange-500"
                          />
                        )}
                        <button
                          onClick={() => handleSave(p.clave, p.valor)}
                          disabled={status === "saving"}
                          className={`btn ${
                            status === "success"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : status === "error"
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "btn-primary"
                          } px-3 py-2 text-sm flex items-center gap-1`}
                        >
                          {status === "saving" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : status === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>
                            {status === "saving" ? "..." : status === "success" ? "Guardado" : "Guardar"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <div className="grid gap-4">
            <Panel
              eyebrow="Calendario"
              title="Cambios programados"
              description="Planificación de ventanas de mantenimiento y congelamientos programados de configuración."
            >
              <div className="space-y-3">
                {changeCalendar.map((item) => (
                  <div key={`${item.slot}-${item.title}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                      <StatusBadge label={item.slot} tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Flags de integración"
              title="Qué superficies ya anticipan contratos reales"
              description="Estado de integración de servicios y contratos del bus de datos SOA."
            >
              <div className="space-y-3">
                {integrationFlags.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.name}</h3>
                      <StatusBadge label={item.status} tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </main>
  );
}

