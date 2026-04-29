import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { clientComponents, interfaceRows, serviceComponents } from "@/lib/sicof-data";

export function SoaArchitecture() {
  return (
    <section id="arquitectura" className="section-shell">
      <div className="page-shell space-y-8">
        <SectionHeading
          badge="Cliente + servicio"
          title="La interfaz ya separa claramente componentes cliente y componentes servicio"
          description="Acá está la base del informe 2: no alcanza con listar pantallas. Hay que mostrar qué cliente consume qué servicio y qué contratos de interfaz existen."
          tone="green"
        />

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel
            eyebrow="Componentes cliente"
            title="Clientes enfocados por tarea"
            description="Interfaces preparadas para despacho, supervisión ejecutiva y gobierno TI."
          >
            <div className="space-y-3">
              {clientComponents.map((client) => (
                <div key={client.name} className="hero-grid-card rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-base font-semibold text-slate-50">{client.name}</h3>
                    <StatusBadge label={client.interfaceName} tone="blue" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{client.purpose}</p>
                  {client.requirements && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {client.requirements?.map((req) => (
                        <StatusBadge key={req} label={req} tone="green" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Servicios SOA"
            title="Contratos listos para documentar interfaces"
            description="Los nombres contract-first ordenan la conversación técnica y evitan pantallas pegadas a detalles de implementación."
          >
            <div className="space-y-3">
              {serviceComponents.map((service, index) => (
                <div key={service.name} className="hero-grid-card rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-base font-semibold text-slate-50">{service.name}</h3>
                    <StatusBadge label={service.contract} tone={index % 2 === 0 ? "orange" : "slate"} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{service.responsibilities}</p>
                  {service.nfr && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.nfr.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/8 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel
          description="Tabla útil para el informe y para mantener coherencia entre frontend, documentación y futura implementación real."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  <th className="pb-2 pr-4 font-medium">Componente</th>
                  <th className="pb-2 pr-4 font-medium text-center">Interfaz / contrato</th>
                </tr>
              </thead>
              <tbody>
                {interfaceRows.map((row) => (
                  <tr key={`${row.component}-${row.interfaceName}`} className="rounded-2xl bg-white/4">
                    <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">
                      {row.component}
                    </td>
                    <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3 text-center">{row.interfaceName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </section>
  );
}
