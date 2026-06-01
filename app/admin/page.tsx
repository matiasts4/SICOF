"use client";

import { useEffect, useState } from "react";
import { Activity, LockKeyhole, ShieldCheck, Waypoints, RefreshCw } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceModuleGrid } from "@/components/workspace-module-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { adminWorkspace } from "@/lib/sicof-navigation";
import { accessPolicies, adminMetrics as mockMetrics, auditTimeline, serviceHealth as mockHealth } from "@/lib/sicof-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [ShieldCheck, LockKeyhole, Activity, Waypoints];

export default function AdminPage() {
  const [health, setHealth] = useState<any[]>(mockHealth);
  const [metrics, setMetrics] = useState<any[]>(mockMetrics);
  const [isRealData, setIsRealData] = useState(false);
  const [loading, setLoading] = useState(true);

  const monitorServices = async () => {
    try {
      setLoading(true);
      
      // Let's ping the services by triggering quick read actions
      const targets = [
        { name: "Flota / buses", url: "/api/fleet?action=get_buses&terminal_id=1" },
        { name: "Estado de carga", url: "/api/soc?action=get_alerts&terminal_id=1" },
        { name: "Frecuencia / regularidad", url: "/api/frequency?action=get_intervals" },
        { name: "Incidentes / bitácora", url: "/api/incidents?action=get_incidents" },
        { name: "Reportes / kpi", url: "/api/reports?action=get_kpis" },
        { name: "Seguridad / auth", url: "/api/auth", isPost: true }
      ];

      let activeCount = 0;
      const newHealth = await Promise.all(
        targets.map(async (target) => {
          const start = performance.now();
          try {
            let res;
            if (target.isPost) {
              res = await fetch(target.url, {
                method: "POST",
                body: JSON.stringify({ action: "ping" }),
                headers: { "Content-Type": "application/json" }
              });
            } else {
              res = await fetch(target.url);
            }
            const end = performance.now();
            const latencyMs = Math.round(end - start);
            
            if (res.ok) {
              const data = await res.json();
              if (data.status === "ok" || res.status === 200 || data.status === "error") {
                // status error is still a response from the service (e.g. invalid action/params but service is alive)
                activeCount++;
                return {
                  name: target.name,
                  status: "Operativo",
                  latency: `${latencyMs}ms`,
                  tone: "green" as Tone
                };
              }
            }
            return {
              name: target.name,
              status: "Fuera de línea",
              latency: "—",
              tone: "red" as Tone
            };
          } catch (err) {
            return {
              name: target.name,
              status: "Fuera de línea",
              latency: "—",
              tone: "red" as Tone
            };
          }
        })
      );

      setHealth(newHealth);
      setIsRealData(activeCount > 0);

      // Fetch report KPIs to show real operational indicators if possible
      if (activeCount > 0) {
        const resKpis = await fetch("/api/reports?action=get_kpis").then(r => r.json());
        if (resKpis.status === "ok" && resKpis.data) {
          // We can map these KPIs to the admin page dashboard metrics to show real system values
          const mappedMetrics = resKpis.data.map((kpi: any) => ({
            label: kpi.label,
            value: kpi.value,
            detail: kpi.detail,
            tone: kpi.tone as Tone
          }));
          setMetrics(mappedMetrics);
        }
      } else {
        setMetrics(mockMetrics);
      }
    } catch (err) {
      console.warn("Failed to check SOA services health", err);
      setIsRealData(false);
      setHealth(mockHealth);
      setMetrics(mockMetrics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    monitorServices();
    const interval = setInterval(monitorServices, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      <PageIntro
        badge="Vista Administrador de Sistema (TI)"
        title="Panel de Control y Gobierno TI"
        description="Supervisión global de accesos, políticas de seguridad, auditoría activa y estado de salud del bus de servicios."
        tone="slate"
        tags={["Auditoría", "Soporte operacional", isRealData ? "Datos Reales (TCP)" : "Modo Demostración"]}
        actions={
          <>
            <button
              onClick={monitorServices}
              disabled={loading}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar SOA
            </button>
          </>
        }
      />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <StatCard
                key={metric.label}
                icon={Icon}
                label={metric.label}
                value={metric.value}
                detail={metric.detail}
                tone={metric.tone}
              />
            );
          })}
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Panel
            eyebrow="Scope guard"
            title="Políticas de acceso visibles y auditables"
            description="Políticas de acceso y perfiles de usuario autorizados en el sistema."
          >
            <div className="space-y-3">
              {accessPolicies.map((policy) => (
                <div key={policy.profile} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{policy.profile}</h3>
                    <StatusBadge label={policy.scope} tone={policy.tone} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{policy.actions}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Auditoría"
            title="Timeline operativo de seguridad"
            description="Historial cronológico de eventos de seguridad y accesos detectados en el sistema."
          >
            <div className="space-y-4">
              {auditTimeline.map((item) => (
                <div key={`${item.time}-${item.event}`} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200/10 font-mono text-sm font-semibold text-slate-100">
                    {item.time}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <p className="font-medium text-slate-100">{item.event}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Salud de servicios"
            title="Monitor visual de componentes SOA (Bus TCP)"
            description="Muestra el estado de comunicación percibido para cada uno de los microservicios en el bus SOA."
          >
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {health.map((service) => (
                <div key={service.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{service.name}</h3>
                    <StatusBadge label={service.status} tone={service.tone} />
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Latencia observada: {service.latency}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <WorkspaceModuleGrid
        eyebrow="Rutas TI"
        title="Módulos de Administración TI"
        description="Herramientas de gestión de accesos, permisos, auditoría y parametrización general del sistema."
        items={adminWorkspace.links.slice(1)}
      />
    </main>
  );
}
