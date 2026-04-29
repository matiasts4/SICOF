import type { Tone } from "@/lib/sicof-data";

export type AppArea = "home" | "terminal" | "cof" | "admin";

export type WorkspaceLink = {
  href: string;
  label: string;
  description: string;
  tone: Tone;
  tag?: string;
};

type ContextPill = {
  label: string;
  tone: Tone;
};

type AreaMeta = {
  label: string;
  kicker: string;
  summary: string;
  tone: Tone;
  context: ContextPill[];
  cta: {
    href: string;
    label: string;
  };
};

type WorkspaceCollection = AreaMeta & {
  links: WorkspaceLink[];
};

export const primarySpaces = [
  {
    href: "/",
    label: "Centro",
    description: "Entrada operacional y visión transversal.",
    tone: "blue" as Tone,
  },
  {
    href: "/terminal",
    label: "Terminal",
    description: "Despacho del patio y preparación de salida.",
    tone: "green" as Tone,
  },
  {
    href: "/cof",
    label: "COF",
    description: "Cobertura multi-terminal y control ejecutivo.",
    tone: "blue" as Tone,
  },
  {
    href: "/admin",
    label: "TI",
    description: "Accesos, auditoría y parametrización visual.",
    tone: "slate" as Tone,
  },
] as const;

export const terminalWorkspace: WorkspaceCollection = {
  label: "Terminal",
  kicker: "Workspace Terminal",
  summary: "El Roble · despacho, energía, frecuencia e incidentes resueltos desde una sola superficie visual.",
  tone: "green",
  context: [
    { label: "El Roble", tone: "green" },
    { label: "Turno mañana", tone: "blue" },
    { label: "6 salidas en foco", tone: "orange" },
  ],
  cta: {
    href: "/terminal/despacho",
    label: "Ir al despacho del turno",
  },
  links: [
    {
      href: "/terminal",
      label: "Resumen",
      description: "Hub del patio con lectura conjunta de flota, salida, frecuencia e incidentes.",
      tone: "green",
      tag: "Hub",
    },
    {
      href: "/terminal/flota",
      label: "Flota",
      description: "Segmentación por patio, padrón, conductor y disponibilidad inmediata.",
      tone: "blue",
    },
    {
      href: "/terminal/despacho",
      label: "Despacho",
      description: "Cola de salida, hitos de geocerca y coordinación con conductor.",
      tone: "orange",
    },
    {
      href: "/terminal/energia",
      label: "Energía",
      description: "SoC, cargadores, buses críticos y sugerencias de reasignación.",
      tone: "green",
    },
    {
      href: "/terminal/frecuencia",
      label: "Frecuencia",
      description: "Brechas por servicio, ventanas críticas y presión de salida del terminal.",
      tone: "orange",
    },
    {
      href: "/terminal/incidentes",
      label: "Incidentes",
      description: "Registro operativo mínimo con evidencia, prioridad y escalamiento local.",
      tone: "red",
    },
  ],
};

export const cofWorkspace: WorkspaceCollection = {
  label: "COF",
  kicker: "Centro COF",
  summary: "Cobertura US4 + US6, terminales comparables y contingencias priorizadas sin ruido micro-operativo.",
  tone: "blue",
  context: [
    { label: "US4 + US6", tone: "blue" },
    { label: "2 terminales en foco", tone: "orange" },
    { label: "12 reportes listos", tone: "green" },
  ],
  cta: {
    href: "/cof/frecuencia",
    label: "Abrir control de frecuencia",
  },
  links: [
    {
      href: "/cof",
      label: "Resumen",
      description: "Hub gerencial con KPIs, terminales en foco y centro de exportación.",
      tone: "blue",
      tag: "Hub",
    },
    {
      href: "/cof/terminales",
      label: "Terminales",
      description: "Comparativa por patio con cumplimiento, disponibilidad y carga de incidentes.",
      tone: "green",
    },
    {
      href: "/cof/frecuencia",
      label: "Frecuencia",
      description: "Ventanas críticas por corredor y acciones tácticas para regularidad.",
      tone: "orange",
    },
    {
      href: "/cof/incidentes",
      label: "Incidentes",
      description: "Tablero multi-terminal de severidad, coordinación y estado de respuesta.",
      tone: "red",
    },
    {
      href: "/cof/kpis",
      label: "KPIs",
      description: "Lectura ejecutiva de cumplimiento, disponibilidad y presión operacional.",
      tone: "blue",
    },
    {
      href: "/cof/reportes",
      label: "Reportes",
      description: "Packs PDF / Excel, calendarios de salida y distribución por destinatario.",
      tone: "slate",
    },
  ],
};

export const adminWorkspace: WorkspaceCollection = {
  label: "TI",
  kicker: "Consola TI",
  summary: "Seguridad visual, trazabilidad y parámetros del sistema sin entrar todavía en backend real.",
  tone: "slate",
  context: [
    { label: "184 perfiles", tone: "blue" },
    { label: "12 políticas", tone: "green" },
    { label: "1 servicio en revisión", tone: "orange" },
  ],
  cta: {
    href: "/admin/usuarios",
    label: "Revisar usuarios y sesiones",
  },
  links: [
    {
      href: "/admin",
      label: "Resumen",
      description: "Hub TI con salud de servicios, políticas activas y timeline de auditoría.",
      tone: "slate",
      tag: "Hub",
    },
    {
      href: "/admin/usuarios",
      label: "Usuarios",
      description: "Roster operativo, sesiones activas y focos de revisión por perfil.",
      tone: "blue",
    },
    {
      href: "/admin/permisos",
      label: "Permisos",
      description: "Capas de acceso por rol, terminal y vista funcional.",
      tone: "green",
    },
    {
      href: "/admin/auditoria",
      label: "Auditoría",
      description: "Eventos críticos, trazabilidad y evidencia de cambios visualmente legibles.",
      tone: "orange",
      tag: "Auditoría",
    },
    {
      href: "/admin/parametros",
      label: "Parámetros",
      description: "Bandas de operación, flags de integración y calendario de cambios controlados.",
      tone: "slate",
      tag: "Configuración",
    },
  ],
};

export const workspaceCollections = {
  terminal: terminalWorkspace,
  cof: cofWorkspace,
  admin: adminWorkspace,
} as const;

export const homeAreaMeta: AreaMeta = {
  label: "Centro",
  kicker: "Centro de mando visual",
  summary: "Entrada operacional del SICOF: 18 pantallas, 3 roles y cobertura completa de procesos críticos con mock data coherente.",
  tone: "blue",
  context: [
    { label: "18 pantallas", tone: "blue" },
    { label: "3 workspaces", tone: "green" },
    { label: "Mock data coordinada", tone: "orange" },
  ],
  cta: {
    href: "/terminal/despacho",
    label: "Entrar al turno",
  },
};

export const workspaceCards = [
  {
    title: "Despacho Terminal",
    href: "/terminal",
    tone: "green" as Tone,
    summary: "Para el despachador que necesita decidir salida, reasignación y cobertura del patio en segundos.",
    quickLinks: terminalWorkspace.links.slice(1, 4),
  },
  {
    title: "Centro COF",
    href: "/cof",
    tone: "blue" as Tone,
    summary: "Para supervisión multi-terminal, priorización de brechas, KPIs y publicación de reportes.",
    quickLinks: cofWorkspace.links.slice(1, 4),
  },
  {
    title: "Consola TI",
    href: "/admin",
    tone: "slate" as Tone,
    summary: "Para seguridad, trazabilidad, alcance por rol y parametrización visual del sistema.",
    quickLinks: adminWorkspace.links.slice(1, 4),
  },
] as const;

export const routeGroups = [terminalWorkspace, cofWorkspace, adminWorkspace] as const;

export function resolveArea(pathname: string): AppArea {
  if (pathname.startsWith("/terminal")) return "terminal";
  if (pathname.startsWith("/cof")) return "cof";
  if (pathname.startsWith("/admin")) return "admin";
  return "home";
}

export function getAreaMeta(area: AppArea): AreaMeta {
  if (area === "home") return homeAreaMeta;
  return workspaceCollections[area];
}
