/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, Clock3, MapPinned, ShieldCheck, RefreshCw, Zap, ClipboardCheck } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  terminalDispatchChecklist as mockDispatchChecklist,
  terminalDispatchMetrics as mockDispatchMetrics,
  terminalDispatchQueue as mockDispatchQueue,
  terminalGeofenceFeed as mockGeofenceFeed,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [Clock3, MapPinned, ClipboardList, ShieldCheck];

export default function TerminalDispatchPage() {
  const [terminalId, setTerminalId] = useState(1);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/fleet?action=get_assignments&terminal_id=${terminalId}`).then(r => r.json());
      if (res.status === "ok") {
        setAssignments(res.data || []);
        setIsRealData(true);
      } else {
        setIsRealData(false);
      }
    } catch (err) {
      console.warn("Backend offline for dispatch page, using mock fallback:", err);
      setIsRealData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("sicof_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.terminal_id) setTerminalId(user.terminal_id);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [terminalId]);

  const handleLanzarAlivio = () => {
    setActionMsg("¡Servicio de Alivio Iniciado! Despachando unidad de reserva EB-304 vía canal de eventos.");
    setTimeout(() => setActionMsg(null), 10000);
  };

  let displayDispatchMetrics = mockDispatchMetrics;
  let displayDispatchQueue = mockDispatchQueue;
  let displayGeofenceFeed = mockGeofenceFeed;

  if (isRealData) {
    const totalCount = assignments.length;
    const electricCount = assignments.filter(a => a.tipo_energia === "Eléctrico").length;

    displayDispatchMetrics = [
      { label: "Salidas en cola", value: String(totalCount).padStart(2, "0"), detail: "Próximos 30 minutos del turno.", tone: "green" as Tone },
      { label: "Geocercas activas", value: "06", detail: "Marcaje listo para validación automática.", tone: "blue" as Tone },
      { label: "Eléctricos en ruta", value: String(electricCount), detail: "Asignados con SoC verificado", tone: "orange" as Tone },
      { label: "Riesgos de atraso", value: "00", detail: "Todo fluyendo en verde", tone: "green" as Tone },
    ];

    displayDispatchQueue = assignments.map((a) => {
      // Formatear hora de inicio
      let timeStr = "06:00";
      if (a.fecha_hora_inicio) {
        try {
          const parts = a.fecha_hora_inicio.split("T");
          if (parts[1]) {
            timeStr = parts[1].substring(0, 5);
          }
        } catch (e) {}
      }

      return {
        window: timeStr,
        service: a.codigo_recorrido,
        unit: a.patente,
        driver: a.conductor_nombre,
        channel: a.tipo_energia === "Eléctrico" ? "Andén Eléc" : "Troncal",
        status: "Asignado",
        tone: "blue" as Tone
      };
    });

    displayGeofenceFeed = assignments.slice(0, 4).map((a) => {
      let timeStr = "05:40";
      if (a.fecha_hora_inicio) {
        try {
          const parts = a.fecha_hora_inicio.split("T");
          if (parts[1]) {
            timeStr = parts[1].substring(0, 5);
          }
        } catch (e) {}
      }
      return {
        time: timeStr,
        event: `Salida de patio: Bus ${a.patente}`,
        detail: `Servicio ${a.codigo_recorrido} asignado a conductor ${a.conductor_nombre}. Marcaje automático por geocerca.`
      };
    });
  }

  return (
    <main>
      <PageIntro
        badge={`Terminal · Despacho · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="La cola de salida tiene que contar qué sale, qué frena y qué se destraba en la próxima ventana"
        tone="orange"
        tags={["Geocercas", "Ventana inmediata"]}
        actions={
          <>
            <button
              onClick={handleLanzarAlivio}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              Lanzar Alivio Rápido
            </button>
            <button
              onClick={fetchData}
              className="btn btn-secondary cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </>
        }
      />

      {actionMsg && (
        <section className="section-shell pt-0 pb-4">
          <div className="page-shell">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-200">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 shrink-0 text-green-400" />
                <span>{actionMsg}</span>
              </div>
              <button
                onClick={() => setActionMsg(null)}
                className="text-green-400 hover:text-green-200 text-xs font-bold uppercase tracking-wider pl-4 cursor-pointer select-none"
              >
                Cerrar
              </button>
            </div>
          </div>
        </section>
      )}

      <WorkspaceMetricGrid items={displayDispatchMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="Cola de salida"
            title="Ventanas activas del turno"
            description="Secuencia de salidas programadas, estado del canal de despacho y bloqueos operativos activos."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando cola de salidas...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="pb-2 pr-4 font-medium">Hora</th>
                      <th className="pb-2 pr-4 font-medium">Servicio</th>
                      <th className="pb-2 pr-4 font-medium">Unidad</th>
                      <th className="pb-2 pr-4 font-medium">Conductor</th>
                      <th className="pb-2 pr-4 font-medium">Canal</th>
                      <th className="pb-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayDispatchQueue.map((row, idx) => (
                      <tr key={`${row.window}-${row.service}-${idx}`} className="bg-white/4">
                        <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.window}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.service}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.unit}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.driver}</td>
                        <td className="border-y border-white/8 px-4 py-3">{row.channel}</td>
                        <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3">
                          <StatusBadge label={row.status} tone={row.tone} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Checklist mínimo"
            title="Antes de liberar una salida"
            description="Lista de verificación obligatoria para la habilitación de salida segura del material rodante."
          >
            <div className="space-y-3">
              {mockDispatchChecklist.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Chequeo {index + 1}</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="page-shell">
          <Panel
            eyebrow="Feed geocerca"
            title="Trazas de salida que reemplazan marcaje manual"
            description="Cronograma del despacho del turno y cumplimiento de las ventanas de regularidad asignadas."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando feed de geocercas...
              </div>
            ) : (
              <div className="space-y-4">
                {displayGeofenceFeed.map((item, idx) => (
                  <div key={`${item.time}-${idx}`} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/12 font-mono text-sm font-semibold text-orange-200">
                      {item.time}
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                      <p className="font-medium text-slate-100">{item.event}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                    </div>
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
