import type { Tone } from "@/lib/sicof-data";

export const homeLaunchMetrics = [
  { label: "Pantallas activas", value: "18", detail: "Home + hubs + módulos por rol.", tone: "blue" as Tone },
  { label: "Roles operativos", value: "03", detail: "Terminal, COF y TI con navegación propia.", tone: "green" as Tone },
  { label: "Alertas visibles", value: "09", detail: "Frecuencia, energía, incidentes y seguridad.", tone: "orange" as Tone },
  { label: "Workspaces listos", value: "100%", detail: "Sin backend, pero con flujo visual consistente.", tone: "slate" as Tone },
];

export const homeQuickLaunch = [
  {
    title: "Turno Terminal El Roble",
    href: "/terminal/despacho",
    summary: "Abrí la cola de salida, revisá geocercas y destrabá el siguiente bloque operativo.",
    tone: "green" as Tone,
  },
  {
    title: "Control de frecuencia COF",
    href: "/cof/frecuencia",
    summary: "Compará corredores, detectá brechas y priorizá intervención multi-terminal.",
    tone: "orange" as Tone,
  },
  {
    title: "Usuarios y sesiones TI",
    href: "/admin/usuarios",
    summary: "Visualizá alcance por perfil, sesiones activas y focos de auditoría inmediata.",
    tone: "slate" as Tone,
  },
];

export const homeOperationalPulse = [
  {
    title: "Despacho del próximo bloque",
    detail: "06:10 · 8 salidas en ventana · 2 buses en verificación energética.",
    tone: "green" as Tone,
  },
  {
    title: "Cobertura COF",
    detail: "US4 con 98% de cumplimiento, US6 bajo presión en corredor 418/421.",
    tone: "blue" as Tone,
  },
  {
    title: "Gobierno TI",
    detail: "184 perfiles activos, 12 políticas vigentes y 1 servicio bajo revisión.",
    tone: "slate" as Tone,
  },
];

export const homeRouteInventory = [
  {
    group: "Terminal",
    tone: "green" as Tone,
    pages: ["/terminal", "/terminal/flota", "/terminal/despacho", "/terminal/energia", "/terminal/frecuencia", "/terminal/incidentes"],
  },
  {
    group: "COF",
    tone: "blue" as Tone,
    pages: ["/cof", "/cof/terminales", "/cof/frecuencia", "/cof/incidentes", "/cof/kpis", "/cof/reportes"],
  },
  {
    group: "TI",
    tone: "slate" as Tone,
    pages: ["/admin", "/admin/usuarios", "/admin/permisos", "/admin/auditoria", "/admin/parametros"],
  },
];

export const terminalFleetMetrics = [
  { label: "Unidades visibles", value: "26", detail: "Patio, reserva y cola inmediata.", tone: "blue" as Tone },
  { label: "Conductores listos", value: "24", detail: "2 relevos aún en confirmación.", tone: "green" as Tone },
  { label: "Reserva táctica", value: "05", detail: "Unidades para contingencia o swap.", tone: "orange" as Tone },
  { label: "Bloques con tensión", value: "02", detail: "Necesitan atención antes del peak.", tone: "red" as Tone },
];

export const terminalFleetRows = [
  { padron: "EB-214", service: "406", driver: "Carla Pizarro", block: "Andén eléctrico", energy: "92%", readiness: "Listo", tone: "green" as Tone },
  { padron: "EB-301", service: "405c", driver: "Juan Rojas", block: "Andén eléctrico", energy: "41%", readiness: "Swap sugerido", tone: "orange" as Tone },
  { padron: "D-226", service: "418", driver: "Andrea Peña", block: "Troncal", energy: "Diésel", readiness: "Asignado", tone: "blue" as Tone },
  { padron: "D-118", service: "B12", driver: "Mauricio Lagos", block: "Reserva", energy: "Diésel", readiness: "En espera", tone: "slate" as Tone },
  { padron: "EB-455", service: "B20", driver: "Daniel Soto", block: "Andén eléctrico", energy: "77%", readiness: "Listo", tone: "green" as Tone },
  { padron: "D-287", service: "421", driver: "Nicole Salas", block: "Troncal", energy: "Diésel", readiness: "Check rápido", tone: "orange" as Tone },
];

export const terminalReserveBlocks = [
  { name: "Reserva inmediata", detail: "2 unidades listas para reemplazo en menos de 6 minutos.", tone: "green" as Tone },
  { name: "Reserva condicionada", detail: "2 unidades con conductor disponible pero revisión rápida pendiente.", tone: "orange" as Tone },
  { name: "Reserva contingencia", detail: "1 unidad retenida para incidente vial o baja energética severa.", tone: "blue" as Tone },
];

export const terminalDriverNotes = [
  "Andrea Peña toma 418 con salida 06:10 y relevo confirmado a las 09:30.",
  "Juan Rojas queda sujeto a decisión energética antes de bloquear 405c.",
  "Nicole Salas cubierta por reserva táctica si el corredor 421 aumenta presión.",
];

export const terminalDispatchMetrics = [
  { label: "Salidas en cola", value: "08", detail: "Próximos 30 minutos del turno.", tone: "green" as Tone },
  { label: "Geocercas activas", value: "06", detail: "Marcaje listo para validación automática.", tone: "blue" as Tone },
  { label: "Relevos pendientes", value: "02", detail: "Requieren confirmación por conductor.", tone: "orange" as Tone },
  { label: "Riesgos de atraso", value: "01", detail: "Servicio 405c en observación.", tone: "red" as Tone },
];

export const terminalDispatchQueue = [
  { window: "06:02", service: "406", unit: "EB-214", driver: "Carla Pizarro", channel: "Andén 1", status: "Liberado", tone: "green" as Tone },
  { window: "06:09", service: "405c", unit: "EB-301", driver: "Juan Rojas", channel: "Andén 2", status: "Revisar energía", tone: "orange" as Tone },
  { window: "06:10", service: "418", unit: "D-226", driver: "Andrea Peña", channel: "Andén 3", status: "En formación", tone: "blue" as Tone },
  { window: "06:14", service: "B12", unit: "D-118", driver: "Mauricio Lagos", channel: "Andén 4", status: "En espera", tone: "slate" as Tone },
  { window: "06:18", service: "B20", unit: "EB-455", driver: "Daniel Soto", channel: "Andén 1", status: "Confirmado", tone: "green" as Tone },
];

export const terminalDispatchChecklist = [
  { title: "Unidad correcta", detail: "Padrón asignado coincide con bloque y servicio." },
  { title: "Conductor confirmado", detail: "Relevo y descanso verificados para la ventana." },
  { title: "Lectura energética", detail: "SoC o autonomía dentro de umbral según recorrido." },
  { title: "Salida trazable", detail: "Geocerca activa y hito de marcaje disponible." },
];

export const terminalGeofenceFeed = [
  { time: "05:42", event: "EB-214 ingresa a corredor de salida", detail: "Geocerca reconocida y ventana 406 liberada." },
  { time: "05:47", event: "D-226 toma posición de salida", detail: "Andén 3 preparado y canal despejado." },
  { time: "05:51", event: "EB-301 retiene despacho", detail: "Autonomía estimada bajo umbral para 405c completo." },
  { time: "05:56", event: "Reserva táctica disponible", detail: "D-118 queda listo para cobertura inmediata." },
];

export const terminalEnergyMetrics = [
  { label: "Buses eléctricos", value: "12", detail: "Patio con lectura energética activa.", tone: "green" as Tone },
  { label: "Cargadores ocupados", value: "05 / 06", detail: "Un punto libre para swap crítico.", tone: "blue" as Tone },
  { label: "SoC bajo umbral", value: "02", detail: "Requieren decisión antes de salida.", tone: "orange" as Tone },
  { label: "Swap sugeridos", value: "01", detail: "Servicio 405c con riesgo alto.", tone: "red" as Tone },
];

export const chargingBoard = [
  { unit: "EB-301", soc: "41%", bay: "Cargador 2", eta: "22 min", status: "Riesgo 405c", tone: "orange" as Tone },
  { unit: "EB-455", soc: "77%", bay: "Cargador 1", eta: "08 min", status: "Listo pronto", tone: "green" as Tone },
  { unit: "EB-118", soc: "58%", bay: "Cargador 5", eta: "16 min", status: "Cargando", tone: "blue" as Tone },
  { unit: "EB-212", soc: "35%", bay: "Cargador 4", eta: "32 min", status: "Bajo umbral", tone: "red" as Tone },
];

export const chargerBays = [
  { name: "Línea 1", occupancy: "Ocupado", load: "90 kW", status: "EB-455 listo en 08 min", tone: "green" as Tone },
  { name: "Línea 2", occupancy: "Ocupado", load: "80 kW", status: "EB-301 sigue bajo umbral", tone: "orange" as Tone },
  { name: "Línea 3", occupancy: "Libre", load: "0 kW", status: "Disponible para swap prioritario", tone: "blue" as Tone },
  { name: "Línea 4", occupancy: "Ocupado", load: "94 kW", status: "EB-212 aún crítico", tone: "red" as Tone },
];

export const swapRecommendations = [
  { service: "405c", currentBus: "EB-301", recommendation: "Mover EB-455 al bloque 06:09", reason: "SoC proyectado insuficiente para vuelta completa.", tone: "orange" as Tone },
  { service: "B20", currentBus: "EB-455", recommendation: "Respaldar con diésel D-118 si baja la ventana", reason: "Mantiene margen si 405c absorbe la unidad prioritaria.", tone: "blue" as Tone },
  { service: "406", currentBus: "EB-214", recommendation: "Mantener asignación", reason: "Carga alta y margen estable para peak AM.", tone: "green" as Tone },
];

export const terminalFrequencyMetrics = [
  { label: "Corredores en verde", value: "04", detail: "Sin brecha fuera de tolerancia.", tone: "green" as Tone },
  { label: "Ventanas ajustadas", value: "02", detail: "Requieren control del patio.", tone: "orange" as Tone },
  { label: "Próxima salida crítica", value: "06:09", detail: "405c con riesgo energético.", tone: "blue" as Tone },
  { label: "Riesgo mayor", value: "421", detail: "Presión troncal subiendo.", tone: "red" as Tone },
];

export const serviceWindows = [
  { service: "406", gap: "2.8 min", headway: "Meta 3.0", nextOut: "06:02", pressure: "Bajo control", tone: "green" as Tone },
  { service: "405c", gap: "4.6 min", headway: "Meta 3.5", nextOut: "06:09", pressure: "Riesgo por energía", tone: "orange" as Tone },
  { service: "418", gap: "3.1 min", headway: "Meta 3.0", nextOut: "06:10", pressure: "Monitoreado", tone: "blue" as Tone },
  { service: "421", gap: "5.2 min", headway: "Meta 3.5", nextOut: "06:18", pressure: "Escalar a COF", tone: "red" as Tone },
];

export const corridorPressure = [
  { corridor: "US4 Poniente", note: "Flujo estable; basta sostener secuencia actual.", tone: "green" as Tone },
  { corridor: "US6 Troncal", note: "Presión al alza por 421 y 418 en ventana compartida.", tone: "red" as Tone },
  { corridor: "B20 Alimentador", note: "Controlado, pero sensible a swap desde flota eléctrica.", tone: "orange" as Tone },
];

export const dispatchMoves = [
  "Si 405c no libera energía a las 06:04, reasignar EB-455 y cubrir B20 con reserva táctica.",
  "Sostener salida 418 como ancla para no abrir hueco simultáneo en troncal.",
  "Escalar 421 a COF si el siguiente gap supera 5.5 min antes de 06:20.",
];

export const terminalIncidentMetrics = [
  { label: "Incidentes abiertos", value: "03", detail: "1 escalado, 2 bajo contención local.", tone: "red" as Tone },
  { label: "Evidencias cargadas", value: "07", detail: "Fotos, notas y trazas de salida.", tone: "blue" as Tone },
  { label: "Bloques afectados", value: "02", detail: "405c y 421 bajo observación.", tone: "orange" as Tone },
  { label: "Casos resueltos", value: "04", detail: "Últimas 2 horas del turno.", tone: "green" as Tone },
];

export const localIncidentCards = [
  { code: "INC-441", title: "SoC insuficiente en 405c", severity: "Alta", bus: "EB-301", area: "Energía", state: "Escalado", description: "Unidad no garantiza vuelta completa si sale en la ventana 06:09.", tone: "red" as Tone },
  { code: "INC-437", title: "Sensor de puerta intermitente", severity: "Media", bus: "D-118", area: "Mantenimiento", state: "En revisión", description: "No bloquea reserva, pero requiere validación antes de reasignar.", tone: "orange" as Tone },
  { code: "INC-432", title: "Congestión en acceso Alameda", severity: "Media", bus: "EB-214", area: "Vial", state: "Monitoreado", description: "Se mantiene ruta con desvío sugerido y tiempo de paso bajo control.", tone: "blue" as Tone },
];

export const evidenceChecklist = [
  "Unidad / padrón identificado.",
  "Servicio y terminal vinculados al caso.",
  "Severidad visible para despacho y COF.",
  "Acción tomada registrada con hora y responsable.",
];

export const escalationFlow = [
  { step: "Local", detail: "Despacho contiene y evalúa impacto inmediato en la ventana.", tone: "green" as Tone },
  { step: "COF", detail: "Se activa si amenaza frecuencia, continuidad o más de un servicio.", tone: "orange" as Tone },
  { step: "TI / soporte", detail: "Interviene si la causa toca permisos, observabilidad o integraciones visibles.", tone: "slate" as Tone },
];

export const cofTerminalMetrics = [
  { label: "Terminales comparados", value: "06", detail: "Cobertura simultánea US4 + US6.", tone: "blue" as Tone },
  { label: "Terminales en foco", value: "02", detail: "Lo Echevers y Colo Colo bajo presión.", tone: "orange" as Tone },
  { label: "Cumplimiento global", value: "96.4%", detail: "Último corte operativo consolidado.", tone: "green" as Tone },
  { label: "Riesgos críticos", value: "03", detail: "Requieren intervención coordinada.", tone: "red" as Tone },
];

export const terminalComparisonRows = [
  { terminal: "El Roble", readiness: "Estable", focus: "Despacho AM controlado", risk: "Bajo", tone: "green" as Tone },
  { terminal: "Colo Colo", readiness: "Tensión media", focus: "Brechas B20 y reserva ajustada", risk: "Medio", tone: "orange" as Tone },
  { terminal: "El Salto", readiness: "Estable", focus: "Sin incidentes críticos", risk: "Bajo", tone: "green" as Tone },
  { terminal: "Lo Echevers", readiness: "Presión alta", focus: "Corredor 421 con hueco creciente", risk: "Alto", tone: "red" as Tone },
  { terminal: "José Arrieta", readiness: "Monitoreado", focus: "Disponibilidad pareja", risk: "Bajo", tone: "blue" as Tone },
  { terminal: "María Angélica", readiness: "Monitoreado", focus: "KPI estable, sin alertas mayores", risk: "Bajo", tone: "blue" as Tone },
];

export const terminalPressureNotes = [
  "Lo Echevers requiere intervención por frecuencia antes de 06:20.",
  "Colo Colo mantiene presión media por reserva limitada en peak.",
  "El Roble puede absorber desvío menor si 405c se mueve a otra unidad.",
];

export const cofFrequencyMetrics = [
  { label: "Corredores en observación", value: "05", detail: "Todos con lectura comparativa visible.", tone: "blue" as Tone },
  { label: "Brechas altas", value: "02", detail: "421 y 405c presionan regularidad.", tone: "red" as Tone },
  { label: "Intervenciones sugeridas", value: "04", detail: "Reasignación, hold y refuerzo.", tone: "orange" as Tone },
  { label: "Corredores estables", value: "03", detail: "Mantienen meta en ventana actual.", tone: "green" as Tone },
];

export const corridorStatus = [
  { corridor: "406", headway: "3.0 min", deviation: "+0.2", action: "Mantener", tone: "green" as Tone },
  { corridor: "405c", headway: "4.6 min", deviation: "+1.1", action: "Reasignar unidad", tone: "orange" as Tone },
  { corridor: "418", headway: "3.1 min", deviation: "+0.1", action: "Monitorear", tone: "blue" as Tone },
  { corridor: "421", headway: "5.2 min", deviation: "+1.7", action: "Escalar", tone: "red" as Tone },
  { corridor: "B20", headway: "3.8 min", deviation: "+0.4", action: "Proteger reserva", tone: "orange" as Tone },
];

export const interventionDeck = [
  { title: "Refuerzo temporal US6", detail: "Mover unidad de reserva táctica para absorber hueco 421.", tone: "red" as Tone },
  { title: "Hold coordinado 405c", detail: "Ajustar salida si swap energético se confirma antes de 06:05.", tone: "orange" as Tone },
  { title: "No tocar 406", detail: "Mantener como corredor ancla para evitar contagio de brechas.", tone: "green" as Tone },
];

export const criticalSlots = [
  { slot: "06:00-06:10", note: "Ventana más sensible para 405c y 418 compartidos.", tone: "orange" as Tone },
  { slot: "06:10-06:20", note: "421 puede romper meta si no recibe cobertura adicional.", tone: "red" as Tone },
  { slot: "06:20-06:30", note: "B20 depende del resultado del swap en flota eléctrica.", tone: "blue" as Tone },
];

export const cofIncidentMetrics = [
  { label: "Incidentes red", value: "11", detail: "Contingencias visibles en todo el sistema.", tone: "red" as Tone },
  { label: "Terminales con casos", value: "04", detail: "COF prioriza severidad y repetición.", tone: "orange" as Tone },
  { label: "Respuesta dentro meta", value: "87%", detail: "Contención dentro de ventana aceptable.", tone: "green" as Tone },
  { label: "Casos auditables", value: "100%", detail: "Todos con evidencia visual mínima.", tone: "blue" as Tone },
];

export const networkIncidentRows = [
  { code: "INC-441", terminal: "El Roble", category: "Energía", severity: "Alta", owner: "COF + despacho", state: "Escalado", tone: "red" as Tone },
  { code: "INC-438", terminal: "Lo Echevers", category: "Frecuencia", severity: "Alta", owner: "COF", state: "En contención", tone: "red" as Tone },
  { code: "INC-436", terminal: "Colo Colo", category: "Reserva", severity: "Media", owner: "Despacho local", state: "Monitoreado", tone: "orange" as Tone },
  { code: "INC-433", terminal: "José Arrieta", category: "Vial", severity: "Media", owner: "COF", state: "Resuelto", tone: "green" as Tone },
];

export const severityBuckets = [
  { label: "Alta", value: "03", detail: "Amenaza regularidad o continuidad del servicio.", tone: "red" as Tone },
  { label: "Media", value: "05", detail: "Afecta operación local pero con contención posible.", tone: "orange" as Tone },
  { label: "Baja", value: "03", detail: "Trazable sin impacto sistémico inmediato.", tone: "blue" as Tone },
];

export const responseCells = [
  "COF coordina cuando el caso rompe ventana, cruza terminales o impacta KPI ejecutivo.",
  "Despacho conserva autonomía para incidentes locales con contención rápida.",
  "TI entra cuando el incidente toca permisos, visibilidad o integraciones percibidas.",
];

export const cofKpiMetrics = [
  { label: "Cumplimiento salidas", value: "96.4%", detail: "Consolidado en ventana actual.", tone: "green" as Tone },
  { label: "Disponibilidad flota", value: "92.8%", detail: "Con reserva táctica visible.", tone: "blue" as Tone },
  { label: "Regularidad crítica", value: "2 corredores", detail: "Requieren acción táctica.", tone: "orange" as Tone },
  { label: "Alertas severas", value: "03", detail: "Inciden en lectura ejecutiva.", tone: "red" as Tone },
];

export const performanceBands = [
  { label: "US4 cumplimiento", value: "97.8%", trend: "+0.6 vs ayer", tone: "green" as Tone },
  { label: "US6 regularidad", value: "93.1%", trend: "-1.2 vs ayer", tone: "orange" as Tone },
  { label: "Disponibilidad eléctrica", value: "89.4%", trend: "estable", tone: "blue" as Tone },
  { label: "Tiempo de contención", value: "11 min", trend: "+2 min", tone: "red" as Tone },
];

export const kpiWatchouts = [
  { title: "US6 se aleja de meta", detail: "Corredor 421 arrastra regularidad del corte AM.", tone: "orange" as Tone },
  { title: "Flota eléctrica tensiona disponibilidad", detail: "La autonomía condiciona decisión antes del peak.", tone: "blue" as Tone },
  { title: "Contención mejora donde hay reserva visible", detail: "Terminales con buffer claro resuelven antes y mejor.", tone: "green" as Tone },
];

export const cofReportMetrics = [
  { label: "Packs listos", value: "12", detail: "PDF y Excel preparados por corte.", tone: "green" as Tone },
  { label: "Destinatarios", value: "05", detail: "COF, patio, auditoría, DTPM y soporte.", tone: "blue" as Tone },
  { label: "Colas en espera", value: "02", detail: "Sujetas a cierre de frecuencia.", tone: "orange" as Tone },
  { label: "Errores de exportación", value: "00", detail: "Sin ruido en el workspace visual.", tone: "slate" as Tone },
];

export const reportCatalog = [
  { name: "Cumplimiento por terminal", format: "PDF", cadence: "06:30 / 12:30 / 18:30", audience: "Gerencia + COF", tone: "blue" as Tone },
  { name: "Brechas de frecuencia", format: "Excel", cadence: "Cada 30 min", audience: "COF + despacho", tone: "orange" as Tone },
  { name: "Incidentes críticos", format: "PDF", cadence: "Bajo demanda", audience: "COF + auditoría", tone: "red" as Tone },
  { name: "Flota eléctrica y SoC", format: "Excel", cadence: "Cada 15 min", audience: "Electroterminal + COF", tone: "green" as Tone },
];

export const deliveryMatrix = [
  "PDF ejecutivo para lectura rápida en dirección y seguimiento diario.",
  "Excel operativo para abrir filtros, comparaciones y trazabilidad detallada.",
  "Distribución diferenciada por audiencia para evitar ruido documental.",
];

export const adminUserMetrics = [
  { label: "Usuarios totales", value: "184", detail: "Entre despacho, COF y soporte.", tone: "blue" as Tone },
  { label: "Sesiones activas", value: "47", detail: "Turno AM con alta concurrencia.", tone: "green" as Tone },
  { label: "Sesiones observadas", value: "03", detail: "Cambio de terminal o alcance fuera de patrón.", tone: "orange" as Tone },
  { label: "Bloqueos preventivos", value: "01", detail: "Perfil en revisión por política.", tone: "red" as Tone },
];

export const userRoster = [
  { name: "Carla Pizarro", role: "Despachador", scope: "El Roble", session: "Activa", note: "Turno AM", tone: "green" as Tone },
  { name: "Mauricio Lagos", role: "Despachador", scope: "Colo Colo", session: "Activa", note: "Cambio de patio bloqueado", tone: "orange" as Tone },
  { name: "Paula Vera", role: "COF Ejecutivo", scope: "Global", session: "Activa", note: "KPIs + incidentes", tone: "blue" as Tone },
  { name: "Ignacio Mella", role: "Administrador TI", scope: "Seguridad", session: "Monitoreada", note: "Ajuste de permisos", tone: "slate" as Tone },
];

export const activeSessions = [
  { title: "El Roble · despacho", detail: "Sesión estable con scope correcto y panel operativo completo.", tone: "green" as Tone },
  { title: "Colo Colo · revisión", detail: "Intento de cambio de alcance quedó bloqueado visualmente.", tone: "orange" as Tone },
  { title: "COF global", detail: "Sesión multi-terminal con lectura consolidada y exportación habilitada.", tone: "blue" as Tone },
];

export const adminPermissionMetrics = [
  { label: "Políticas vigentes", value: "12", detail: "Por rol, terminal y vista funcional.", tone: "green" as Tone },
  { label: "Cambios pendientes", value: "03", detail: "Requieren revisión antes de aplicar.", tone: "orange" as Tone },
  { label: "Roles críticos", value: "02", detail: "COF global y TI seguridad.", tone: "blue" as Tone },
  { label: "Conflictos detectados", value: "01", detail: "Alcance cruzado en despacho local.", tone: "red" as Tone },
];

export const scopeMatrix = [
  { profile: "Despachador local", canSee: "Solo patio asignado", canDo: "Despacho, salida, incidentes locales", tone: "green" as Tone },
  { profile: "Supervisor de terminal", canSee: "Patio + reserva + contingencias", canDo: "Ajustar cobertura y validar cambio de unidad", tone: "blue" as Tone },
  { profile: "COF Ejecutivo", canSee: "Todos los terminales", canDo: "Comparar, escalar y exportar", tone: "orange" as Tone },
  { profile: "Administrador TI", canSee: "Seguridad y gobierno", canDo: "Políticas, sesiones, parámetros", tone: "slate" as Tone },
];

export const pendingPermissionChanges = [
  "Revisión de alcance temporal para supervisión COF en Colo Colo.",
  "Restricción explícita de cambio de terminal para despacho local.",
  "Separación visual entre configuración técnica y control operacional.",
];

export const adminAuditMetrics = [
  { label: "Eventos 24h", value: "1.248", detail: "Trazas visibles para seguridad y soporte.", tone: "blue" as Tone },
  { label: "Eventos críticos", value: "09", detail: "Cambios de política y accesos observados.", tone: "red" as Tone },
  { label: "Tiempos fuera de patrón", value: "04", detail: "Sesiones o exports con comportamiento atípico.", tone: "orange" as Tone },
  { label: "Cobertura de trazas", value: "100%", detail: "Eventos clave con hora y responsable.", tone: "green" as Tone },
];

export const auditFeedRows = [
  { time: "05:32", event: "Scope guard validado", actor: "Despacho El Roble", impact: "Acceso correcto", tone: "green" as Tone },
  { time: "05:47", event: "Cambio de política temporal", actor: "TI Seguridad", impact: "COF observa Colo Colo", tone: "orange" as Tone },
  { time: "06:01", event: "Export bundle verificado", actor: "COF", impact: "PDF dentro de SLA visual", tone: "blue" as Tone },
  { time: "06:08", event: "Latencia alta incidentes", actor: "Monitor SOA", impact: "Servicio en revisión", tone: "red" as Tone },
];

export const auditHighlights = [
  { title: "Cambios de alcance siempre visibles", detail: "No se ocultan detrás de tablas técnicas: la lectura es inmediata.", tone: "green" as Tone },
  { title: "Eventos críticos suben de jerarquía", detail: "Lo severo toma espacio visual primero, no al final de la lista.", tone: "red" as Tone },
  { title: "Trazas útiles para explicar el sistema", detail: "Esta pantalla sirve como base del futuro diseño de auditoría real.", tone: "blue" as Tone },
];

export const adminParameterMetrics = [
  { label: "Parámetros activos", value: "18", detail: "Ventanas, umbrales y flags visuales.", tone: "blue" as Tone },
  { label: "Flags sensibles", value: "04", detail: "Impactan despacho, frecuencia o exportación.", tone: "orange" as Tone },
  { label: "Calendarios en vigor", value: "03", detail: "Mantenimiento, cortes y horario peak.", tone: "green" as Tone },
  { label: "Cambios congelados", value: "01", detail: "Esperando validación multi-área.", tone: "slate" as Tone },
];

export const parameterGroups = [
  { group: "Operación", detail: "Umbrales de frecuencia, hold permitido y buffer por patio.", tone: "green" as Tone },
  { group: "Energía", detail: "SoC mínimo por servicio eléctrico y reglas de swap sugerido.", tone: "blue" as Tone },
  { group: "Reportes", detail: "Cortes horarios, formatos y paquetes por audiencia.", tone: "orange" as Tone },
  { group: "Seguridad", detail: "Policies visibles, timeouts y scope exceptions temporales.", tone: "slate" as Tone },
];

export const changeCalendar = [
  { slot: "Hoy 22:00", title: "Ventana de mantenimiento menor", detail: "Sin impacto esperado en lectura operativa del turno AM.", tone: "blue" as Tone },
  { slot: "Mañana 05:00", title: "Ajuste de buffer en 421", detail: "Se observará efecto en frecuencia y contingencia COF.", tone: "orange" as Tone },
  { slot: "Viernes 21:30", title: "Revisión de flags de exportación", detail: "Control de formatos y distribución documental.", tone: "green" as Tone },
];

export const integrationFlags = [
  { name: "GPS / geocercas", status: "Observado", detail: "Mock visible preparado para contrato real posterior.", tone: "blue" as Tone },
  { name: "Lectura SoC", status: "Prioritario", detail: "Su futura integración condiciona energía y despacho.", tone: "orange" as Tone },
  { name: "Export bundles", status: "Estable", detail: "Narrativa visual ya preparada para backend real.", tone: "green" as Tone },
  { name: "Trail de auditoría", status: "Diseñado", detail: "Pantalla lista para aterrizar almacenamiento real más adelante.", tone: "slate" as Tone },
];
