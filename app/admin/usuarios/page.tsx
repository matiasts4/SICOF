/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MonitorDot, ShieldCheck, UserRound, Users } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  activeSessions as mockActiveSessions,
  adminUserMetrics as mockUserMetrics,
  userRoster as mockUserRoster,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [Users, MonitorDot, ShieldCheck, UserRound];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_users", params: {} })
        }).then(r => r.json());

        if (res.status === "ok") {
          setUsers(res.data || []);
          setIsRealData(true);
        } else {
          setIsRealData(false);
        }
      } catch (err) {
        console.warn("Backend offline for admin/users page, using mock fallback:", err);
        setIsRealData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  let displayUserMetrics = mockUserMetrics;
  let displayUserRoster = mockUserRoster;
  let displayActiveSessions = mockActiveSessions;

  if (isRealData && !loading) {
    const totalUsers = users.length;
    const activeCount = users.filter(u => u.activo === 1).length;
    const adminCount = users.filter(u => u.rol === "Admin TI" || u.rol === "Admin COF").length;
    const dispatcherCount = users.filter(u => u.rol === "Despachador").length;

    displayUserMetrics = [
      { label: "Usuarios del roster", value: String(totalUsers).padStart(2, "0"), detail: "Registrados en base de datos", tone: "blue" as Tone },
      { label: "Cuentas activas", value: String(activeCount).padStart(2, "0"), detail: "Habilitadas para loguearse", tone: "green" as Tone },
      { label: "Administradores", value: String(adminCount).padStart(2, "0"), detail: "COF y TI con privilegios", tone: "orange" as Tone },
      { label: "Despachadores", value: String(dispatcherCount).padStart(2, "0"), detail: "Operadores en terminales", tone: "slate" as Tone },
    ];

    displayUserRoster = users.map((u) => {
      let scope = "Acceso Global";
      if (u.id_terminal === 1) scope = "Terminal El Roble";
      else if (u.id_terminal === 2) scope = "Terminal Colo Colo";
      else if (u.id_terminal === 3) scope = "Terminal El Salto";
      else if (u.id_terminal === 4) scope = "Terminal Lo Echevers";
      else if (u.id_terminal === 5) scope = "Terminal José Arrieta";
      else if (u.id_terminal === 6) scope = "Terminal María Angélica";

      return {
        name: u.nombre,
        role: u.rol,
        scope,
        session: u.activo === 1 ? "Activo" : "Suspendido",
        note: `username: ${u.username}`,
        tone: (u.activo === 1 ? "green" : "slate") as Tone
      };
    });

    displayActiveSessions = users.slice(0, 3).map((u) => ({
      title: u.nombre,
      detail: `Usuario ${u.username} con rol ${u.rol} y alcance de ${u.id_terminal ? "Terminal" : "COF global"} listo para operar.`,
      tone: "green" as Tone
    }));
  }

  return (
    <main>
      <PageIntro
        badge={`TI · Usuarios · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
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

      <WorkspaceMetricGrid items={displayUserMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
          <Panel
            eyebrow="Roster de acceso"
            title="Perfiles que hoy pisan el sistema"
            description="La tabla cruza nombre, rol, alcance y estado de sesión para que TI entienda el mapa humano del sistema sin ruido extra."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando roster de usuarios...
              </div>
            ) : (
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
                    {displayUserRoster.map((row, idx) => (
                      <tr key={`${row.name}-${idx}`} className="bg-white/4">
                        <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.name}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.role}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.scope}</td>
                        <td className="border-y border-white/8 px-4 py-3">
                          <StatusBadge label={row.session} tone={row.tone} />
                        </td>
                        <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3 text-slate-400 font-mono text-xs">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Sesiones relevantes"
            title="Lo que TI mira sin entrar todavía al detalle técnico"
            description="Esta columna transforma eventos de sesión en una historia legible para soporte, seguridad y diseño futuro."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando sesiones...
              </div>
            ) : (
              <div className="space-y-3">
                {displayActiveSessions.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                      <StatusBadge label="Sesión válida" tone={item.tone} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.detail}</p>
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
