# Estado Actual Visual (Fase 1) - SICOF

Este documento detalla la implementación visual actual del Sistema de Control de Flotas (SICOF) al cierre de la Fase 1. El sistema es actualmente un **prototipo de alta fidelidad front-only** desarrollado en Next.js.

## 1. Identidad Visual y UI
- **Estética**: *Dark Command Center*. Uso de paleta oscura (`#080a0f`) con acentos en azul y naranja para estados operativos.
- **Background**: Implementación de `DotPattern` (Magic UI style) con posicionamiento fijo y máscara radial para profundidad táctica.
- **Tipografía**: Manrope y Sora para lectura clara; JetBrains Mono para datos técnicos y métricas.
- **Layout**: Diseño responsivo con contenedores estandarizados (`max-w-[1000px]`) para evitar saltos visuales en la navegación.

## 2. Componentes de Navegación
- **FloatingNavbar**: 
  - Barra superior persistente con efecto glassmorphism.
  - CTA unificado "Ir al Dashboard" que redirige al workspace correspondiente.
  - Selector de roles/vistas: Centro, Terminal, COF, TI.
- **WorkspaceTabs**:
  - Pestañas secundarias pegajosas (*sticky*) bajo la navbar principal.
  - Navegación interna por módulos (Flota, Despacho, Energía, Incidentes, etc.).
  - Estados activos con alto contraste (`!text-zinc-950` sobre fondo blanco).

## 3. Visualización Geoespacial (Mapas)
- **Tecnología**: MapLibre GL JS integrado vía CDN para interactividad completa.
- **Cartografía**: Estilo *Dark Matter* (CartoDB) centrado en Santiago, Chile (Plaza Italia).
- **Simulación**: 
  - Capa de buses dinámicos con estados (En tránsito, Retrasado, Detenido).
  - Identificadores reales de buses (patentes y recorridos de Santiago).
  - Superposición de datos en tiempo real (mockeados) sobre el mapa vectorial.

## 4. Módulos Implementados (Vistas Visuales)
### Workspace Terminal
- **Flota**: Grilla de buses con SoC (estado de carga) y telemetría simulada.
- **Despacho**: Listado de salidas programadas y estados de cumplimiento.
- **Energía**: Monitoreo de carga y autonomía estimada.
- **Incidentes**: Timeline de eventos operativos.

### Workspace COF (Centro de Operaciones de Flota)
- **Monitoreo Global**: Vista de red completa y KPIs de alto nivel.
- **Reportabilidad**: Estructura visual para generación de informes.

### Workspace Admin (TI)
- **Gestión**: Vistas para administración de usuarios, roles y auditoría.

## 5. Gestión de Datos (Mock Layer)
- Toda la lógica de datos reside en archivos estáticos:
  - `lib/sicof-data.ts`: Datos maestros de módulos, roles y NFRs.
  - `lib/sicof-navigation.ts`: Estructura de enlaces y jerarquía de páginas.
  - `lib/sicof-screen-data.ts`: Contenido específico para cada panel operativo.

---
**Nota**: El sistema actual NO tiene persistencia, lógica de servidor, ni comunicación con APIs reales. Todo el comportamiento es simulado mediante React State y Effects.
