/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { BarChart3, Gauge, ShieldCheck, TrendingUp, RefreshCw } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  cofKpiMetrics as mockKpiMetrics,
  kpiWatchouts as mockWatchouts,
  performanceBands as mockPerformanceBands,
} from "@/lib/sicof-screen-data";
import type { Tone } from "@/lib/sicof-data";

const icons = [BarChart3, ShieldCheck, Gauge, TrendingUp];

export default function CofKpisPage() {
  const [kpiMetrics, setKpiMetrics] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resKpi, resSummary] = await Promise.all([
        fetch("/api/reports?action=get_kpis").then(r => r.json()),
        fetch("/api/reports?action=get_operation_summary").then(r => r.json())
      ]);

      if (resKpi.status === "ok" && resSummary.status === "ok") {
        setKpiMetrics(resKpi.data || []);
        setSummaries(resSummary.data || []);
        setIsRealData(true);
      } else {
        setIsRealData(false);
      }
    } catch (err) {
      console.warn("Backend offline for COF KPIs, using mock fallback:", err);
      setIsRealData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  let displayKpiMetrics = mockKpiMetrics;
  let displayPerformanceBands = mockPerformanceBands;
  let displayWatchouts = mockWatchouts;

  if (isRealData) {
    displayKpiMetrics = kpiMetrics.map((k) => ({
      label: k.label,
      value: k.value,
      detail: k.detail,
      tone: k.tone as Tone
    }));

    // Performance bands based on actual summaries
    displayPerformanceBands = summaries.map((s) => ({
      label: `Cumplimiento ${s.terminal}`,
      value: `${s.compliance}%`,
      trend: s.compliance > 90 ? "Estable" : "Bajo umbral",
      tone: s.tone as Tone
    }));

    // Watchouts based on active incidents
    displayWatchouts = summaries
      .filter((s) => s.open_incidents > 0)
      .map((s) => ({
        title: `Watchout: Terminal ${s.terminal}`,
        detail: `Terminal con ${s.open_incidents} incidentes activos que afectan la disponibilidad (${s.availability}%).`,
        tone: (s.open_incidents > 2 ? "red" : "orange") as Tone
      }));
    if (displayWatchouts.length === 0) {
      displayWatchouts = mockWatchouts;
    }
  }

  return (
    <main>
      <PageIntro
        badge={`COF · KPIs · ${isRealData ? "Datos Reales (TCP)" : "Modo Demostración (Mock)"}`}
        title="Indicadores de Desempeño Operacional"
        description="Consola de indicadores claves de rendimiento (KPIs) para la supervisión ejecutiva y control de regularidad del servicio."
        tone="blue"
        tags={["Lectura ejecutiva", "Comparabilidad"]}
        actions={
          <>
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar KPIs
            </button>
          </>
        }
      />

      <WorkspaceMetricGrid items={displayKpiMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
          <Panel
            font-display="true"
            eyebrow="Bandas de desempeño"
            title="Métricas que sostienen la conversación ejecutiva"
            description="Consolidado de cumplimiento y disponibilidad agregada con indicación de tendencia y desvíos."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando métricas ejecutivas...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {displayPerformanceBands.map((item, idx) => (
                  <div key={`${item.label}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.label}</h3>
                      <StatusBadge label={item.trend} tone={item.tone} />
                    </div>
                    <p className="mt-4 font-mono text-3xl font-semibold tracking-tight text-slate-50">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            eyebrow="Watchouts"
            title="Lecturas que explican el KPI"
            description="Alertas operacionales específicas y puntos de control que inciden en el comportamiento de los KPIs."
          >
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                Cargando watchouts...
              </div>
            ) : (
              <div className="space-y-3">
                {displayWatchouts.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                      <StatusBadge label="Foco" tone={item.tone} />
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
