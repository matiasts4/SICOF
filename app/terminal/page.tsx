import Link from "next/link";
import { Activity, AlertTriangle, BatteryCharging, Bus, Clock3 } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceModuleGrid } from "@/components/workspace-module-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { MapPreview } from "@/components/ui/map-preview";
import { terminalWorkspace } from "@/lib/sicof-navigation";
import { departureTimeline, incidentLog, liveFleet, terminalAlerts, terminalMetrics, terminalSegments } from "@/lib/sicof-data";

const icons = [Bus, Clock3, BatteryCharging, AlertTriangle];

export default function TerminalPage() {
  return (
    <main>
      <PageIntro
        badge="Vista Despachador de Terminal"
        title="Despacho enfocado, sin ruido y con lectura inmediata del estado del patio"
        description="La interfaz del despachador prioriza preparación de salida, flota segmentada, autonomía eléctrica y alertas de frecuencia. Todo lo demás pasa a segundo plano, como debe ser."
        tone="green"
        tags={["Terminal El Roble", "Operación en vivo"]}
        actions={
          <>
            <Link
              href="/terminal/despacho"
              className="btn btn-secondary"
            >
              Abrir despacho del turno
            </Link>
            <Link
              href="/terminal/energia"
              className="btn btn-primary"
            >
              Revisar energía
            </Link>
          </>
        }
      />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {terminalMetrics.map((metric, index) => {
            const Icon = icons[index] ?? Activity;

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
        <div className="page-shell">
          <Panel 
            eyebrow="Monitoreo Georeferenciado" 
            title="Ubicación de flota en tiempo real" 
            description="Visualización de buses en ruta y estado de carga por geocerca. Basado en Mapbox Standard Dark."
          >
            <MapPreview className="h-[400px]" />
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Panel
            eyebrow="Flota segmentada"
            title="Segmentos del patio"
            description="Cada bloque muestra buses y conductores disponibles dentro del terminal. Sin contaminación de otros patios."
          >
            <div className="space-y-3">
              {terminalSegments.map((segment) => (
                <div key={segment.name} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">{segment.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {segment.buses} buses · {segment.drivers} conductores
                      </p>
                    </div>
                    <StatusBadge label={segment.status} tone={segment.tone} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Energía y Frecuencia"
            title="Fleet board para salida inminente"
            description="Lectura conjunta de padrón, conductor, SoC y ETA de salida. Esa combinación es la que destraba el despacho real."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Bus</th>
                    <th className="pb-2 pr-4 font-medium">Conductor</th>
                    <th className="pb-2 pr-4 font-medium">SoC</th>
                    <th className="pb-2 pr-4 font-medium">ETA</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {liveFleet.map((bus) => (
                    <tr key={bus.padron} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">
                        {bus.padron} · {bus.route}
                      </td>
                      <td className="border-y border-white/8 px-4 py-3">{bus.driver}</td>
                      <td className="border-y border-white/8 px-4 py-3">{bus.soc}</td>
                      <td className="border-y border-white/8 px-4 py-3">{bus.eta}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={bus.status} tone={bus.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel
            eyebrow="Marcaje automático"
            title="Timeline de salida por geocerca"
            description="Esta vista cuenta la historia del despacho sin pedirle trabajo manual extra al operador. Ese es el valor real de la automatización."
          >
            <div className="space-y-4">
              {departureTimeline.map((item) => (
                <div key={`${item.time}-${item.title}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/12 font-mono text-sm font-semibold text-blue-200">
                      {item.time}
                    </div>
                    <div className="mt-2 h-full w-px bg-gradient-to-b from-blue-400/40 to-transparent" />
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <p className="font-medium text-slate-100">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-4">
            <Panel
              eyebrow="Alertas preventivas"
              title="Prioridades del turno"
              description="Tres alertas máximas. Nada de llenar la pantalla con ruido operacional."
            >
              <div className="space-y-3">
                {terminalAlerts.map((alert) => (
                  <div key={alert.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{alert.label}</h3>
                      <StatusBadge label="En foco" tone={alert.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Incidentes operativos"
              title="Bitácora mínima para escalar sin fricción"
              description="Aunque esta vista vive mejor en COF, el despachador igual necesita registrar y ver el contexto inmediato."
            >
              <div className="space-y-3">
                {incidentLog.map((incident) => (
                  <div key={`${incident.type}-${incident.bus}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">{incident.type} · {incident.bus}</p>
                        <p className="mt-1 text-sm text-slate-400">{incident.detail}</p>
                      </div>
                      <StatusBadge label={incident.status} tone={incident.tone} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <WorkspaceModuleGrid
        eyebrow="Rutas del despacho"
        title="El workspace terminal se expande en cinco vistas operacionales"
        description="Cada módulo resuelve una decisión distinta del patio, pero mantiene el mismo lenguaje visual y el mismo contexto compartido en la barra superior."
        items={terminalWorkspace.links.slice(1)}
      />
    </main>
  );
}
