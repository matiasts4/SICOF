import Link from "next/link";
import { MonitorDot, ShieldCheck, UserRound, Users } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { activeSessions, adminUserMetrics, userRoster } from "@/lib/sicof-screen-data";

const icons = [Users, MonitorDot, ShieldCheck, UserRound];

export default function AdminUsersPage() {
  return (
    <main>
      <PageIntro
        badge="TI · Usuarios"
        title="Usuarios y sesiones se leen como superficie operativa, no como una tabla administrativa sin criterio"
        description="Esta pantalla pone foco en alcance, sesión y señales de revisión para que TI explique rápido quién está adentro, con qué scope y bajo qué condiciones."
        tone="blue"
        tags={["Perfiles", "Sesiones activas"]}
        actions={
          <>
            <Link
              href="/admin/permisos"
              className="btn btn-secondary"
            >
              Ir a permisos
            </Link>
            <Link
              href="/admin/auditoria"
              className="btn btn-primary"
            >
              Abrir auditoría
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={adminUserMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
          <Panel
            eyebrow="Roster de acceso"
            title="Perfiles que hoy pisan el sistema"
            description="La tabla cruza nombre, rol, alcance y estado de sesión para que TI entienda el mapa humano del sistema sin ruido extra."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Usuario</th>
                    <th className="pb-2 pr-4 font-medium">Rol</th>
                    <th className="pb-2 pr-4 font-medium">Scope</th>
                    <th className="pb-2 pr-4 font-medium">Sesión</th>
                    <th className="pb-2 font-medium">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {userRoster.map((row) => (
                    <tr key={row.name} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.name}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.role}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.scope}</td>
                      <td className="border-y border-white/8 px-4 py-3">
                        <StatusBadge label={row.session} tone={row.tone} />
                      </td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Sesiones relevantes"
            title="Lo que TI mira sin entrar todavía al detalle técnico"
            description="Esta columna transforma eventos de sesión en una historia legible para soporte, seguridad y diseño futuro."
          >
            <div className="space-y-3">
              {activeSessions.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                    <StatusBadge label={item.title} tone={item.tone} />
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
