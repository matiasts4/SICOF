"use client";

import { useEffect, useState } from "react";
import { CalendarClock, FileDown, MailCheck, PackageCheck, Loader2, Play, Download, RefreshCw } from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { WorkspaceMetricGrid } from "@/components/workspace-metric-grid";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { deliveryMatrix } from "@/lib/sicof-screen-data";

const icons = [PackageCheck, MailCheck, CalendarClock, FileDown];

interface CatalogItem {
  name: string;
  format: string;
  cadence: string;
  audience: string;
  tone: "blue" | "orange" | "red" | "green" | "slate";
}

interface GeneratedReport {
  id_reporte: number;
  nombre: string;
  tipo: string;
  fecha_creacion: string;
  url_archivo: string;
  creador: string;
}

const STATIC_CATALOG: CatalogItem[] = [
  { name: "Cumplimiento por terminal", format: "PDF", cadence: "06:30 / 12:30 / 18:30", audience: "Gerencia + COF", tone: "blue" },
  { name: "Brechas de frecuencia", format: "Excel", cadence: "Cada 30 min", audience: "COF + despacho", tone: "orange" },
  { name: "Incidentes críticos", format: "PDF", cadence: "Bajo demanda", audience: "COF + auditoría", tone: "red" },
  { name: "Flota eléctrica y SoC", format: "Excel", cadence: "Cada 15 min", audience: "Electroterminal + COF", tone: "green" },
];

export default function CofReportsPage() {
  const [generatedList, setGeneratedList] = useState<GeneratedReport[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchGeneratedReports = async () => {
    try {
      const res = await fetch("/api/reports?action=get_reports_list");
      const json = await res.json();
      if (json.status === "ok") {
        setGeneratedList(json.data);
      }
    } catch (err) {
      console.error("Error fetching reports", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchGeneratedReports();
  }, []);

  const handleGenerate = async (item: CatalogItem) => {
    setGenerating(item.name);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const ext = item.format.toLowerCase() === "pdf" ? "pdf" : "xlsx";
      const filename = `${item.name.toLowerCase().replace(/\s+/g, "_")}_${timestamp}.${ext}`;

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_report",
          params: {
            nombre: filename,
            tipo: item.format,
            creador: "operador_cof"
          }
        })
      });
      const json = await res.json();
      if (json.status === "ok") {
        await fetchGeneratedReports();
      } else {
        alert(json.message || "Error al solicitar reporte");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (rep: GeneratedReport) => {
    try {
      const res = await fetch("/api/reports?action=get_daily_report");
      const json = await res.json();
      if (json.status !== "ok" || !json.data) {
        alert("No se pudo obtener la información real del reporte.");
        return;
      }
      
      const reportData = json.data;
      const kpis = reportData.kpis || [];
      const terminals = reportData.terminals || [];
      const incidents = reportData.incidents || [];

      if (rep.tipo.toLowerCase() === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Reporte Consolidado de Operación - SICOF", 15, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Archivo: ${rep.nombre}`, 15, 28);
        doc.text(`Generado por: ${rep.creador}`, 15, 34);
        doc.text(`Fecha: ${new Date(rep.fecha_creacion).toLocaleString("es-CL")}`, 15, 40);

        // Divider line
        doc.setDrawColor(200);
        doc.line(15, 45, 195, 45);

        // KPIs Section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Indicadores Clave de Desempeño (KPIs)", 15, 55);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        let y = 63;
        kpis.forEach((k: any) => {
          doc.setFont("helvetica", "bold");
          doc.text(`${k.label ?? ""}:`, 15, y);
          doc.setFont("helvetica", "normal");
          doc.text(`${k.value ?? ""} (${k.detail ?? ""})`, 65, y);
          y += 6;
        });

        y += 5;
        doc.setDrawColor(200);
        doc.line(15, y, 195, y);
        y += 10;

        // Terminals Section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Estado de Terminales", 15, y);
        y += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Terminal", 15, y);
        doc.text("Buses", 60, y);
        doc.text("Eléct.", 75, y);
        doc.text("Asig.", 90, y);
        doc.text("Inc.", 105, y);
        doc.text("Cumpl.", 120, y);
        doc.text("Dispon.", 145, y);
        y += 2;
        doc.line(15, y, 195, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        terminals.forEach((t: any) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(String(t.terminal ?? ""), 15, y);
          doc.text(String(t.buses_total ?? 0), 60, y);
          doc.text(String(t.buses_electric ?? 0), 75, y);
          doc.text(String(t.active_assignments ?? 0), 90, y);
          doc.text(String(t.open_incidents ?? 0), 105, y);
          doc.text(`${t.compliance ?? 0}%`, 120, y);
          doc.text(`${t.availability ?? 0}%`, 145, y);
          y += 6;
        });

        y += 5;
        doc.setDrawColor(200);
        doc.line(15, y, 195, y);
        y += 10;

        // Incidents Section
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Incidentes Recientes en Red", 15, y);
        y += 8;

        doc.setFontSize(9);
        doc.text("ID", 15, y);
        doc.text("Fecha", 35, y);
        doc.text("Bus", 65, y);
        doc.text("Terminal", 85, y);
        doc.text("Tipo", 120, y);
        doc.text("Severidad", 155, y);
        doc.text("Estado", 175, y);
        y += 2;
        doc.line(15, y, 195, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        incidents.forEach((i: any) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(`INC-${i.id_incidente ?? ""}`, 15, y);
          doc.text(String(i.fecha_hora ?? "").replace("T", " ").substring(0, 16), 35, y);
          doc.text(String(i.patente ?? ""), 65, y);
          doc.text(String(i.terminal_nombre ?? ""), 85, y);
          doc.text(String(i.tipo ?? ""), 120, y);
          doc.text(String(i.severidad ?? ""), 155, y);
          doc.text(String(i.estado ?? ""), 175, y);
          y += 6;
        });

        doc.save(rep.nombre.replace(".pdf", "") + ".pdf");
      } else {
        // Excel/CSV Mode
        let csvContent = "\ufeff"; // BOM for Excel to display Spanish accents correctly
        csvContent += `REPORTE CONSOLIDADO DE OPERACION - SICOF\n`;
        csvContent += `Archivo;${rep.nombre}\n`;
        csvContent += `Generado por;${rep.creador}\n`;
        csvContent += `Fecha de Creacion;${new Date(rep.fecha_creacion).toLocaleString("es-CL")}\n\n`;

        csvContent += `INDICADORES CLAVE (KPIs)\n`;
        csvContent += `Indicador;Valor;Detalle\n`;
        kpis.forEach((k: any) => {
          csvContent += `"${k.label}";"${k.value}";"${k.detail}"\n`;
        });
        csvContent += `\n`;

        csvContent += `ESTADO DE TERMINALES\n`;
        csvContent += `Terminal;Buses Activos;Flota Electrica;Asignaciones Activas;Incidentes Abiertos;Cumplimiento;Disponibilidad\n`;
        terminals.forEach((t: any) => {
          csvContent += `"${t.terminal}";${t.buses_total};${t.buses_electric};${t.active_assignments};${t.open_incidents};"${t.compliance}%";"${t.availability}%"\n`;
        });
        csvContent += `\n`;

        csvContent += `HISTORIAL DE INCIDENTES RECIENTES\n`;
        csvContent += `ID;Fecha;Bus;Terminal;Tipo;Severidad;Estado;Detalle\n`;
        incidents.forEach((i: any) => {
          csvContent += `"INC-${i.id_incidente}";"${i.fecha_hora.replace("T", " ")}";"${i.patente}";"${i.terminal_nombre}";"${i.tipo}";"${i.severidad}";"${i.estado}";"${i.descripcion || ''}"\n`;
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", rep.nombre.replace(".xlsx", ".csv"));
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error al descargar reporte", err);
      alert("Error al descargar el archivo de datos.");
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return isoString.replace("T", " ").substring(0, 16);
    } catch {
      return isoString;
    }
  };

  // Métricas dinámicas basadas en los reportes reales generados
  const dynamicMetrics = [
    { label: "Packs de catálogo", value: String(STATIC_CATALOG.length), detail: "Formatos pre-estructurados.", tone: "blue" as const },
    { label: "Reportes generados", value: String(generatedList.length), detail: "Disponibles en el repositorio local.", tone: "green" as const },
    { label: "Cola de distribución", value: "Sincronizada", detail: "Alertas vía canal oficial.", tone: "orange" as const },
    { label: "Canal SOA", value: "Activo", detail: "Servicio 'repor' conectado.", tone: "green" as const }
  ];

  return (
    <main>
      <PageIntro
        badge="COF · Reportes"
        title="Generación y Descarga de Reportes Consolidados"
        description="Genere y descargue en tiempo real los consolidados operacionales a través del bus SOA y la persistencia relacional del backend."
        tone="slate"
        tags={["PDF / Excel", "Distribución por audiencia"]}
        actions={
          <>
            <button
              onClick={fetchGeneratedReports}
              disabled={loadingList}
              className="btn btn-primary cursor-pointer gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar Reportes
            </button>
          </>
        }
      />

      <WorkspaceMetricGrid items={dynamicMetrics} icons={icons} />

      <section className="section-shell pt-0">
        <div className="page-shell grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel
            eyebrow="Catálogo de reportes"
            title="Packs disponibles para generación inmediata"
            description="Presione 'Generar' para procesar el reporte de forma asíncrona mediante el bus SOA."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="pb-2 pr-4 font-medium pl-4">Reporte</th>
                    <th className="pb-2 pr-4 font-medium">Formato</th>
                    <th className="pb-2 pr-4 font-medium">Cadencia</th>
                    <th className="pb-2 pr-4 font-medium">Audiencia</th>
                    <th className="pb-2 font-medium text-right pr-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {STATIC_CATALOG.map((row) => (
                    <tr key={row.name} className="bg-white/4">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-3 font-medium text-slate-100">{row.name}</td>
                      <td className="border-y border-white/8 px-4 py-3">
                        <StatusBadge label={row.format} tone={row.tone} />
                      </td>
                      <td className="border-y border-white/8 px-4 py-3 text-slate-300">{row.cadence}</td>
                      <td className="border-y border-white/8 px-4 py-3 text-slate-400">{row.audience}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-3 text-right pr-4">
                        <button
                          onClick={() => handleGenerate(row)}
                          disabled={generating !== null}
                          className="btn btn-primary px-3 py-1.5 text-xs flex items-center gap-1 ml-auto"
                        >
                          {generating === row.name ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3 fill-current" />
                          )}
                          <span>{generating === row.name ? "Generando" : "Generar"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            eyebrow="Repositorio de descargas"
            title="Historial de reportes generados"
            description="Consulte y descargue los archivos procesados en esta sesión."
          >
            {loadingList ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                <span className="ml-2 text-slate-400 text-sm">Cargando descargas...</span>
              </div>
            ) : generatedList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-white/8 rounded-2xl bg-white/2">
                No se han generado reportes aún. Presione "Generar" a la izquierda.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {generatedList.map((rep) => (
                  <div key={rep.id_reporte} className="rounded-2xl border border-white/8 bg-white/4 p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100 truncate max-w-xs">{rep.nombre}</span>
                        <StatusBadge label={rep.tipo} tone={rep.tipo.toLowerCase() === "pdf" ? "red" : "green"} />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {formatTime(rep.fecha_creacion)} • Generado por {rep.creador}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(rep)}
                      className="btn btn-secondary px-3 py-2 flex items-center gap-1 text-xs shrink-0 cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>Bajar</span>
                    </button>
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

