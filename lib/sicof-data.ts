export type Tone = "blue" | "orange" | "green" | "red" | "slate";

export const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/terminal", label: "Despacho" },
  { href: "/cof", label: "COF" },
  { href: "/admin", label: "TI" },
  { href: "/#documentacion", label: "Docs" },
];

export const heroMetrics = [
  {
    label: "Flota consolidada",
    value: "930 buses",
    detail: "US4 y US6 en una sola lectura operacional.",
    tone: "blue" as Tone,
  },
  {
    label: "Terminales coordinados",
    value: "6 patios",
    detail: "Cada vista mantiene foco por terminal o cobertura global.",
    tone: "green" as Tone,
  },
  {
    label: "Alertas preventivas",
    value: "< 2 min",
    detail: "Frecuencia, SoC e incidentes visibles antes del quiebre de servicio.",
    tone: "orange" as Tone,
  },
  {
    label: "Exportación ejecutiva",
    value: "PDF + Excel",
    detail: "Salida diaria para auditoría, COF y seguimiento con DTPM.",
    tone: "slate" as Tone,
  },
];

export const heroSignals = ["US4 + US6", "6 terminales", "930 buses", "GPS + geocercas + SoC"];

export const roleCards = [
  {
    role: "Despachador de Terminal",
    route: "/terminal",
    tone: "green" as Tone,
    focus: "Operación puntual por patio",
    decision: "Decide salida, reasignación y cobertura inmediata del terminal.",
    seesFirst: "buses listos, SoC crítico, brechas y próxima ventana de salida",
    summary:
      "Vista concentrada en buses, conductores, marcaje de salida y alertas de frecuencia del terminal asignado.",
  },
  {
    role: "Administrador de Operaciones (COF)",
    route: "/cof",
    tone: "blue" as Tone,
    focus: "Visión global y toma de decisión",
    decision: "Prioriza contingencias, compara terminales y ordena escalamiento operativo.",
    seesFirst: "cumplimiento, disponibilidad, incidentes críticos y cola de reportes",
    summary:
      "Panel ejecutivo con salud por terminal, contingencias mayores, KPIs y centro de reportes para gestión transversal.",
  },
  {
    role: "Administrador de Sistema (TI)",
    route: "/admin",
    tone: "slate" as Tone,
    focus: "Seguridad, permisos y continuidad",
    decision: "Controla alcance por rol, auditoría y salud percibida de servicios SOA.",
    seesFirst: "políticas activas, trazabilidad de eventos y degradación de servicios",
    summary:
      "Espacio de soporte para políticas de acceso, auditoría y salud de servicios sin entrar en diseño de persistencia.",
  },
];

export const moduleCards = [
  {
    title: "Gestión de flota segmentada",
    description:
      "Tarjetas de patio, padrón, conductor y estado de máquina para que cada terminal vea solo su contexto útil.",
    client: "Terminal Operations Board",
    service: "Fleet Context Service",
    route: "/terminal",
    tone: "blue" as Tone,
  },
  {
    title: "Control de acceso por terminal",
    description:
      "Badges de alcance, bloqueo visual por terminal y administración de perfiles operativos y de soporte.",
    client: "Access Scope Console",
    service: "Access Control Service",
    route: "/admin",
    tone: "slate" as Tone,
  },
  {
    title: "Monitoreo de carga (SoC)",
    description:
      "Lectura continua de autonomía por bus eléctrico con umbrales de despacho y sugerencia de reasignación.",
    client: "Energy Readiness Panel",
    service: "Charge Monitor Service",
    route: "/terminal",
    tone: "green" as Tone,
  },
  {
    title: "Marcaje de salida automático",
    description:
      "Cadena visual del despacho con hitos de geocerca, hora efectiva y confirmación de salida sin intervención manual.",
    client: "Departure Timeline",
    service: "Departure Trace Service",
    route: "/terminal",
    tone: "orange" as Tone,
  },
  {
    title: "Tablero de control de frecuencias",
    description:
      "Heatmap y cintas de alerta para detectar atrasos críticos, huecos entre buses y presión de operación.",
    client: "Frequency Command Deck",
    service: "Frequency Alert Service",
    route: "/cof",
    tone: "orange" as Tone,
  },
  {
    title: "Registro de incidentes",
    description:
      "Bitácora unificada con severidad, bus, conductor, ubicación y evidencia preparada para escalamiento.",
    client: "Incident Journal",
    service: "Incident Stream Service",
    route: "/cof",
    tone: "red" as Tone,
  },
  {
    title: "Dashboard gerencial",
    description:
      "Lectura ejecutiva de KPIs operacionales, cumplimiento por terminal y comparación entre unidades de servicio.",
    client: "COF Pulse Dashboard",
    service: "Operations Insight Service",
    route: "/cof",
    tone: "blue" as Tone,
  },
  {
    title: "Exportación de reportes",
    description:
      "Centro de salida visual para reportes diarios, packs PDF y matrices Excel orientadas a auditoría.",
    client: "Reporting Workbench",
    service: "Report Export Service",
    route: "/cof",
    tone: "slate" as Tone,
  },
];

export const clientComponents = [
  {
    name: "Landing / Fleet Narrative",
    purpose: "Explica contexto, valor operativo y cobertura completa de módulos.",
    interfaceName: "Marketing + system overview",
  },
  {
    name: "Terminal Operations Board",
    purpose: "Despacho por terminal, preparación de salida y control de SoC.",
    interfaceName: "Live dispatch console",
  },
  {
    name: "COF Pulse Dashboard",
    purpose: "Visión global de terminales, incidentes, KPIs y exportables.",
    interfaceName: "Executive operations cockpit",
  },
  {
    name: "Access Scope Console",
    purpose: "Permisos, auditoría y políticas de alcance para usuarios TI.",
    interfaceName: "Security & policy workspace",
  },
];

export const serviceComponents = [
  {
    name: "Fleet Context Service",
    contract: "fleet.segment.snapshot",
    responsibilities: "Entrega padrón filtrado por terminal, conductor y disponibilidad operativa.",
  },
  {
    name: "Access Control Service",
    contract: "scope.guard.profile",
    responsibilities: "Resuelve rol, terminal asignado y acciones visibles en cada cliente.",
  },
  {
    name: "Charge Monitor Service",
    contract: "energy.soc.readiness",
    responsibilities: "Consolida autonomía estimada, umbrales y sugerencias de despacho para buses eléctricos.",
  },
  {
    name: "Departure Trace Service",
    contract: "dispatch.geofence.departure",
    responsibilities: "Confirma salida automática y conserva hitos horarios por patio.",
  },
  {
    name: "Frequency Alert Service",
    contract: "frequency.alert.window",
    responsibilities: "Calcula brechas entre buses y detecta atrasos críticos antes del incumplimiento.",
  },
  {
    name: "Incident Stream Service",
    contract: "incident.timeline.feed",
    responsibilities: "Agrupa incidentes, severidad y evidencia para despacho y escalamiento COF.",
  },
  {
    name: "Operations Insight Service",
    contract: "kpi.executive.snapshot",
    responsibilities: "Publica KPIs gerenciales por terminal y unidad de servicio.",
  },
  {
    name: "Report Export Service",
    contract: "report.bundle.export",
    responsibilities: "Prepara paquetes de salida PDF / Excel y colas de publicación diaria.",
  },
];

export const interfaceRows = [
  {
    component: "Terminal Operations Board",
    interfaceName: "Panel de despacho en tiempo real",
  },
  {
    component: "COF Pulse Dashboard",
    interfaceName: "Cockpit gerencial multi-terminal",
  },
  {
    component: "Access Scope Console",
    interfaceName: "Consola de políticas y auditoría",
  },
  {
    component: "Fleet Context Service",
    interfaceName: "Contrato fleet.segment.snapshot",
  },
  {
    component: "Frequency Alert Service",
    interfaceName: "Contrato frequency.alert.window",
  },
  {
    component: "Report Export Service",
    interfaceName: "Contrato report.bundle.export",
  },
];

export const commandPreview = {
  terminal: "El Roble",
  operatingWindow: "05:30 - 09:00",
  departuresReady: "21 / 24",
  delayedWindow: "2 brechas críticas",
  buses: [
    { padron: "EB-214", route: "406", driver: "C. Pizarro", soc: "92%", status: "Listo", tone: "green" as Tone },
    { padron: "D-118", route: "B12", driver: "M. Lagos", soc: "—", status: "En patio", tone: "blue" as Tone },
    { padron: "EB-301", route: "405c", driver: "J. Rojas", soc: "41%", status: "Revisar", tone: "orange" as Tone },
    { padron: "D-226", route: "418", driver: "A. Peña", soc: "—", status: "Salida 06:10", tone: "slate" as Tone },
  ],
  incidents: [
    "Batería bajo umbral en EB-301 para 405c.",
    "Atraso acumulado de 4 min en ventana tramo poniente.",
    "Conductor reemplazo confirmado para D-226.",
  ],
};

export const terminalMetrics = [
  { label: "Buses listos", value: "21", detail: "3 en preparación final", tone: "green" as Tone },
  { label: "Salidas próximas", value: "08", detail: "Próximos 30 minutos", tone: "blue" as Tone },
  { label: "Alertas SoC", value: "02", detail: "Bajo autonomía mínima", tone: "orange" as Tone },
  { label: "Incidentes abiertos", value: "01", detail: "Escalado a mantenimiento", tone: "red" as Tone },
];

export const terminalSegments = [
  { name: "Andén eléctrico", buses: 12, drivers: 11, status: "Operativo", tone: "green" as Tone },
  { name: "Andén troncal", buses: 9, drivers: 10, status: "Tensión media", tone: "orange" as Tone },
  { name: "Reserva táctica", buses: 5, drivers: 3, status: "Cobertura", tone: "blue" as Tone },
];

export const liveFleet = [
  { padron: "EB-214", route: "406", driver: "Carla Pizarro", soc: "92%", eta: "06:02", status: "Listo", tone: "green" as Tone },
  { padron: "EB-301", route: "405c", driver: "Juan Rojas", soc: "41%", eta: "06:09", status: "Umbral bajo", tone: "orange" as Tone },
  { padron: "D-226", route: "418", driver: "Andrea Peña", soc: "—", eta: "06:10", status: "Asignado", tone: "blue" as Tone },
  { padron: "D-118", route: "B12", driver: "Mauricio Lagos", soc: "—", eta: "06:14", status: "En patio", tone: "slate" as Tone },
  { padron: "EB-455", route: "B20", driver: "Daniel Soto", soc: "77%", eta: "06:18", status: "Carga suficiente", tone: "green" as Tone },
];

export const departureTimeline = [
  { time: "05:42", title: "Geocerca activada", detail: "EB-214 sale del perímetro El Roble." },
  { time: "05:44", title: "Marcaje automático", detail: "Salida registrada sin input manual." },
  { time: "05:48", title: "Frecuencia verificada", detail: "Tramo 406 queda dentro de ventana esperada." },
  { time: "05:51", title: "Alerta preventiva", detail: "EB-301 requiere reevaluación por SoC." },
];

export const terminalAlerts = [
  { label: "Brecha crítica 405c", detail: "4 min sobre meta en próxima vuelta.", tone: "red" as Tone },
  { label: "Autonomía ajustada", detail: "EB-301 bajo umbral para recorrido completo.", tone: "orange" as Tone },
  { label: "Cobertura de relevo", detail: "Conductor de reserva confirmado a las 06:05.", tone: "green" as Tone },
];

export const incidentLog = [
  { type: "Falla menor", bus: "D-118", detail: "Sensor de puerta reporta intermitencia.", status: "En revisión", tone: "orange" as Tone },
  { type: "Contingencia vial", bus: "EB-214", detail: "Desvío sugerido por congestión en eje Alameda.", status: "Monitoreado", tone: "blue" as Tone },
  { type: "Check energía", bus: "EB-301", detail: "Se evalúa intercambio por unidad de reserva.", status: "Escalado", tone: "red" as Tone },
];

export const cofMetrics = [
  { label: "Cumplimiento salidas", value: "96.4%", detail: "Últimas 4 horas", tone: "green" as Tone },
  { label: "Terminales en foco", value: "2 / 6", detail: "Seguimiento reforzado", tone: "orange" as Tone },
  { label: "Incidentes críticos", value: "03", detail: "Escalados al COF", tone: "red" as Tone },
  { label: "Reportes listos", value: "12", detail: "Cortes por servicio y patio", tone: "blue" as Tone },
];

export const terminalHealth = [
  { terminal: "El Roble", compliance: 98, availability: 94, incidents: 1, tone: "green" as Tone },
  { terminal: "Colo Colo", compliance: 93, availability: 90, incidents: 2, tone: "orange" as Tone },
  { terminal: "El Salto", compliance: 97, availability: 95, incidents: 0, tone: "green" as Tone },
  { terminal: "Lo Echevers", compliance: 91, availability: 88, incidents: 3, tone: "red" as Tone },
  { terminal: "José Arrieta", compliance: 95, availability: 93, incidents: 1, tone: "blue" as Tone },
  { terminal: "María Angélica", compliance: 94, availability: 92, incidents: 1, tone: "blue" as Tone },
];

export const escalations = [
  { title: "Hueco troncal US6", detail: "Ventana 07:00-07:20 con presión creciente en 418 / 421.", owner: "COF + despacho troncal", tone: "red" as Tone },
  { title: "Energía ajustada en flota eléctrica", detail: "3 buses con autonomía proyectada menor al plan de salida.", owner: "Electroterminal + despacho", tone: "orange" as Tone },
  { title: "Incidente vial resuelto", detail: "Plan de desvío aplicado y regularidad recuperada en 406.", owner: "COF", tone: "green" as Tone },
];

export const reportQueue = [
  { name: "Cumplimiento por terminal", format: "PDF", schedule: "06:30 / 12:30 / 18:30", status: "Listo" },
  { name: "Brechas de frecuencia", format: "Excel", schedule: "Cada 30 min", status: "En cola" },
  { name: "Resumen de incidentes", format: "PDF", schedule: "Bajo demanda", status: "Disponible" },
  { name: "SoC de flota eléctrica", format: "Excel", schedule: "Cada 15 min", status: "Disponible" },
];

export const adminMetrics = [
  { label: "Perfiles activos", value: "184", detail: "Despacho, COF y soporte", tone: "blue" as Tone },
  { label: "Políticas vigentes", value: "12", detail: "Por rol, terminal y vista", tone: "green" as Tone },
  { label: "Eventos auditados", value: "1.248", detail: "Últimas 24 horas", tone: "slate" as Tone },
  { label: "Servicios en riesgo", value: "01", detail: "Latencia alta en incidentes", tone: "orange" as Tone },
];

export const accessPolicies = [
  { profile: "Despachador El Roble", scope: "Solo terminal El Roble", actions: "Despacho, salidas, incidentes locales", tone: "green" as Tone },
  { profile: "COF Ejecutivo", scope: "Todos los terminales", actions: "KPIs, contingencias, reportes", tone: "blue" as Tone },
  { profile: "Administrador TI", scope: "Seguridad y configuración", actions: "Roles, auditoría, parametrización", tone: "slate" as Tone },
];

export const auditTimeline = [
  { time: "05:32", event: "Scope guard aplicado", detail: "Sesión de despacho restringida a El Roble." },
  { time: "05:47", event: "Cambio de política", detail: "Ajuste temporal de permisos para supervisión COF." },
  { time: "06:01", event: "Verificación de exportación", detail: "Cola de reportes PDF responde dentro de SLA visual." },
  { time: "06:08", event: "Latencia observada", detail: "Incident Stream Service sobre 1.8s en contingencia." },
];

export const serviceHealth = [
  { name: "Fleet Context Service", status: "Estable", latency: "620 ms", tone: "green" as Tone },
  { name: "Access Control Service", status: "Estable", latency: "210 ms", tone: "green" as Tone },
  { name: "Charge Monitor Service", status: "Estable", latency: "480 ms", tone: "green" as Tone },
  { name: "Frequency Alert Service", status: "Bajo presión", latency: "1.1 s", tone: "orange" as Tone },
  { name: "Incident Stream Service", status: "Revisar", latency: "1.8 s", tone: "red" as Tone },
  { name: "Report Export Service", status: "Estable", latency: "760 ms", tone: "blue" as Tone },
];

export const documentationCards = [
  {
    title: "Propósito del SICOF",
    path: "#proposito",
    summary: "Entiende cómo el sistema centraliza la operación de US4 y US6 para reducir tiempos de respuesta.",
  },
  {
    title: "Guía del Despachador",
    path: "#guia-despacho",
    summary: "Instrucciones sobre cómo leer la flota, gestionar el SoC y confirmar salidas automáticas.",
  },
  {
    title: "Manual del COF",
    path: "#manual-cof",
    summary: "Uso del heatmap de frecuencia, gestión de incidentes críticos y exportación de reportes.",
  },
  {
    title: "Seguridad y TI",
    path: "#seguridad-ti",
    summary: "Control de alcances por terminal, políticas de acceso y trazabilidad de eventos operativos.",
  },
];

export const report2Notes = [
  "El sitio centraliza la toma de decisiones operativas eliminando el ruido micro-operativo innecesario.",
  "Cada rol cuenta con una superficie visual optimizada para su decisión crítica (salida, gestión o auditoría).",
];
