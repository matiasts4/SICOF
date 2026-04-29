# SICOF · Sistema de Diseño Visual

## 1. Objetivo

Definir una dirección visual coherente para el **sistema visual front-only** de SICOF antes de entrar a backend, persistencia o implementación técnica detallada.

La UI busca verse como un **command center moderno**, sobrio y altamente legible, con una identidad de shell flotante inspirada en:

- `arxonlabsLanding/components/Navbar.tsx` para la barra superior glass / floating
- `clientes/entre-ruedas/components/entre-ruedas/Topbar.tsx` para comportamiento de product shell
- `clientes/entre-ruedas/components/entre-ruedas/Hero.tsx` para ritmo, jerarquía y entrada menos marketinera

## 2. Principios de diseño

### 2.1 Claridad operacional primero

La interfaz no compite por atención. Prioriza:

- estado actual
- alertas críticas
- próxima decisión operativa
- contexto por rol

### 2.2 Segmentación visual por responsabilidad

- **Despachador** → detalle táctico y próximo despacho
- **COF** → síntesis multi-terminal y escalamiento
- **TI** → permisos, trazabilidad y salud de servicios

### 2.3 Oscuro, táctico, pero legible

Se eligió una estética **dark command center** porque encaja mejor con:

- paneles densos de monitoreo
- jerarquía de estados
- lectura prolongada
- contraste fuerte de KPIs y alertas

## 3. Tokens base

Los tokens viven en `app/globals.css`.

### Paleta principal

- `--background: #050b17`
- `--foreground: #e5edf7`
- `--brand: #3b82f6`
- `--brand-secondary: #60a5fa`
- `--accent: #f97316`
- `--success: #10b981`
- `--danger: #f43f5e`

### Superficies

- panel translúcido: `--panel`
- panel más sólido: `--panel-strong`
- superficie táctica secundaria: `--surface-muted`
- bordes suaves con opacidad baja para efecto glass controlado

## 4. Tipografía

- **Fira Sans** → cuerpo, labels, textos de interfaz
- **Fira Code** → KPIs, tiempos, métricas, identificadores operativos

Esto ayuda a separar visualmente:

- lenguaje narrativo
- datos duros / operacionales

## 5. Layout

## Estructura general

- contenedor principal `page-shell`
- secciones respiradas con `section-shell`
- paneles reutilizables con `Panel`
- cards métricas con `StatCard`
- badges de estado con `StatusBadge`
- tabs de workspace con `WorkspaceTabs`
- layouts por rol en `app/terminal/layout.tsx`, `app/cof/layout.tsx` y `app/admin/layout.tsx`

## Navbar

`components/floating-navbar.tsx`

Características:

- fija y centrada, con espaciado lateral amplio
- floating shell entre pill y topbar productizada
- fondo translúcido con blur y capas sutiles de profundidad
- navegación primaria a Centro / Terminal / COF / TI
- contexto visible del workspace activo
- CTA dinámica según el área actual
- drawer mobile con accesos principales y módulos del workspace actual

## Home como lobby operacional

La home ya no se trata como landing explicativa. Cumple cuatro funciones:

- mostrar el pulso del sistema
- ofrecer quick launch a los flujos más críticos
- abrir los tres workspaces principales
- exponer el mapa completo de pantallas

## Workspaces

Cada rol vive dentro de un workspace con shell compartido y módulos específicos:

- **Terminal**: hub + flota + despacho + energía + frecuencia + incidentes
- **COF**: hub + terminales + frecuencia + incidentes + KPIs + reportes
- **TI**: hub + usuarios + permisos + auditoría + parámetros

## 6. Componentes UI base

### `Panel`

Caja reusable para bloques operacionales, tablas, timelines y documentos.

### `StatusBadge`

Codifica estados con cinco tonos:

- blue
- green
- orange
- red
- slate

### `StatCard`

Métrica primaria con:

- ícono
- valor principal
- contexto corto
- badge de clasificación

### `MetricBar`

Barra de cumplimiento / disponibilidad para lectura rápida en COF.

## 7. Decisiones UX clave

### Alertas limitadas

No saturar con veinte alertas iguales. La UI muestra pocas alertas, pero priorizadas.

### Datos accionables antes que datos exhaustivos

Ejemplo:

- el despachador ve SoC + ETA + estado
- COF ve cumplimiento + disponibilidad + incidentes
- TI ve políticas + timeline de auditoría + salud de servicios

### Accesibilidad mínima obligatoria

- contraste alto
- `focus-visible` global
- targets táctiles amplios
- sin depender solo del color para comunicar estado

## 8. Relación con informe 2

Esta capa visual deja listo:

- qué clientes existen
- qué servicios SOA se infieren
- qué interfaces visibles tiene cada componente
- qué RF cubre cada pantalla y cada workspace
- qué NFR son importantes en cada caso

Además, desde esta iteración, la capa visual se complementa con `docs/informe2.md`, donde se aterrizan:

- persistencia conceptual
- modelo lógico de datos
- diccionario de datos base
- contratos cliente/servicio documentados para los puntos 5, 6 y 7

## 9. Archivos relevantes

- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/terminal/layout.tsx`
- `app/cof/layout.tsx`
- `app/admin/layout.tsx`
- `components/floating-navbar.tsx`
- `components/workspace-tabs.tsx`
- `components/workspace-module-grid.tsx`
- `components/workspace-metric-grid.tsx`
- `components/ui/*`
- `components/landing/*`
- `app/terminal/**/*.tsx`
- `app/cof/**/*.tsx`
- `app/admin/**/*.tsx`
- `lib/sicof-navigation.ts`
- `lib/sicof-screen-data.ts`
- `docs/informe2.md`
