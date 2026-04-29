import Link from "next/link";
import { Activity, LockKeyhole, ShieldCheck, Waypoints } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceModuleGrid } from "@/components/workspace-module-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { adminWorkspace } from "@/lib/sicof-navigation";
import { accessPolicies, adminMetrics, auditTimeline, serviceHealth } from "@/lib/sicof-data";

const icons = [ShieldCheck, LockKeyhole, Activity, Waypoints];

export default function AdminPage() {
  return (
    <main>
      <PageIntro
        badge="Vista Administrador de Sistema (TI)"
        title="Gobierno visual del sistema: accesos, trazas y parámetros listos para crecer"
        description="La consola TI no existe para decorar. Existe para hacer evidente quién entra, qué puede ver, qué cambió y dónde aparece riesgo en la superficie del sistema."
        tone="slate"
        tags={["Auditoría", "Soporte operacional", "Servicios SOA"]}
        actions={
          <>
            <Link
              href="/admin/usuarios"
              className="btn btn-secondary"
            >
              Abrir usuarios
            </Link>
            <Link
              href="/admin/permisos"
              className="btn btn-primary"
            >
              Abrir permisos
            </Link>
          </>
        }
      />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {adminMetrics.map((metric, index) => {
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
            description="Buenísimo tener seguridad, pero si nadie entiende el alcance visual de cada rol, después vienen los errores de operación."
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
            description="No es persistencia todavía. Es diseño de observabilidad: qué eventos deben verse y cómo se leen rápido."
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
            title="Monitor visual de componentes SOA"
            description="Esto sirve para la historia técnica: muestra qué servicios existen, cómo se perciben desde TI y dónde hay riesgo de degradación."
          >
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {serviceHealth.map((service) => (
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
        title="Usuarios, permisos, auditoría y parámetros ya viven como módulos separados"
        description="Eso ordena la experiencia y prepara la futura implementación real sin mezclar seguridad, observabilidad y configuración en una sola pantalla difusa."
        items={adminWorkspace.links.slice(1)}
      />
    </main>
  );
}
