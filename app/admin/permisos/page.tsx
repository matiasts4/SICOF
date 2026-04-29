import Link from "next/link";
import { KeyRound, Layers3, ShieldCheck, Waypoints } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminPermissionMetrics, pendingPermissionChanges, scopeMatrix } from "@/lib/sicof-screen-data";

const icons = [ShieldCheck, Layers3, Waypoints, KeyRound];

export default function AdminPermissionsPage() {
  return (
    <main>
      <PageIntro
        badge="TI · Permisos"
        title="Los permisos se diseñan como capas de alcance claras, no como reglas escondidas en una pantalla gris"
        description="La vista muestra perfiles, alcance visual y cambios pendientes para que el usuario entienda enseguida qué puede ver cada rol y por qué."
        tone="green"
        tags={["RBAC visual", "Scope guard"]}
        actions={
          <>
            <Link
              href="/admin/usuarios"
              className="btn btn-secondary"
            >
              Volver a usuarios
            </Link>
            <Link
              href="/admin/parametros"
              className="btn btn-primary"
            >
              Ver parámetros
            </Link>
          </>
        }
      />

      <WorkspaceMetricGrid items={adminPermissionMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
          <Panel
            eyebrow="Matriz de alcance"
            title="Qué ve y qué hace cada perfil"
            description="Esta tabla aterriza el concepto de scope guard de manera entendible para operación, seguridad y stakeholders no técnicos."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Perfil</th>
                    <th className="pb-2 pr-4 font-medium">Puede ver</th>
                    <th className="pb-2 font-medium">Puede hacer</th>
                  </tr>
                </thead>
                <tbody>
                  {scopeMatrix.map((row) => (
                    <tr key={row.profile} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.profile}</td>
                      <td className="border-y border-white/8 px-4 py-3">{row.canSee}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                        <StatusBadge label={row.canDo} tone={row.tone} className="max-w-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Cambios pendientes"
            title="Ajustes de permisos bajo revisión"
            description="Con pocas frases claras alcanza para anticipar conflictos de acceso y preparar el flujo real de aprobación."
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
