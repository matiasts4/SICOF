# SICOF · Cobertura Funcional y Mapa SOA Visual

## 1. Objetivo

Traducir los requerimientos funcionales del informe 1 a una estructura visible de:

- rutas
- componentes cliente
- componentes servicio
- interfaz mostrada
- requerimientos no funcionales priorizados

## 2. Rutas del sistema visual

| Ruta | Perfil principal | Propósito |
| --- | --- | --- |
| `/` | Todos | lobby operacional, quick launch y mapa completo de workspaces |
| `/terminal` | Despachador | hub del patio con foco táctico |
| `/terminal/flota` | Despachador | flota segmentada, disponibilidad y reserva táctica |
| `/terminal/despacho` | Despachador | cola de salida, geocercas y checklist de liberación |
| `/terminal/energia` | Despachador | SoC, cargadores y swaps sugeridos |
| `/terminal/frecuencia` | Despachador | presión por servicio y jugadas del turno |
| `/terminal/incidentes` | Despachador | incidentes locales, evidencia y escalamiento |
| `/cof` | COF | hub multi-terminal con lectura global |
| `/cof/terminales` | COF | comparativa entre patios y priorización |
| `/cof/frecuencia` | COF | regularidad de red e intervenciones tácticas |
| `/cof/incidentes` | COF | contingencias severas y ownership de respuesta |
| `/cof/kpis` | COF | lectura ejecutiva y bandas de desempeño |
| `/cof/reportes` | COF | catálogo visual de reportes y distribución |
| `/admin` | TI | hub de gobierno visual |
| `/admin/usuarios` | TI | roster de usuarios y sesiones activas |
| `/admin/permisos` | TI | matriz de alcance y cambios pendientes |
| `/admin/auditoria` | TI | trazabilidad visible y eventos críticos |
| `/admin/parametros` | TI | grupos de configuración, calendario y flags |

## 3. Mapa RF → cliente → servicio

| RF | Módulo visual | Cliente | Servicio SOA conceptual | Ruta |
| --- | --- | --- | --- | --- |
| RF-001 | Gestión de flota segmentada | Terminal Fleet Workspace | Fleet Context Service | `/terminal`, `/terminal/flota` |
| RF-002 | Control de acceso por terminal | Access Scope Console | Access Control Service | `/admin`, `/admin/usuarios`, `/admin/permisos` |
| RF-003 | Monitoreo de carga (SoC) | Energy Readiness Panel | Charge Monitor Service | `/terminal`, `/terminal/energia` |
| RF-004 | Marcaje de salida automático | Departure Command Board | Departure Trace Service | `/terminal`, `/terminal/despacho` |
| RF-005 | Tablero de frecuencias | Frequency Command Deck | Frequency Alert Service | `/terminal/frecuencia`, `/cof/frecuencia` |
| RF-006 | Registro de incidentes | Incident Journal | Incident Stream Service | `/terminal/incidentes`, `/cof/incidentes` |
| RF-007 | Dashboard gerencial | COF Insight Workspace | Operations Insight Service | `/cof`, `/cof/terminales`, `/cof/kpis` |
| RF-008 | Exportación de reportes | Reporting Workbench | Report Export Service | `/cof/reportes` |

## 4. Interfaces cliente visibles

| Cliente | Interfaz | RF | NFR priorizados |
| --- | --- | --- | --- |
| Centro Operacional SICOF | lobby visual y quick launch | RF-001, RF-005, RF-007 | claridad, onboarding, consistencia |
| Terminal Workspace | hub + módulos de flota, despacho, energía, frecuencia e incidentes | RF-001, RF-003, RF-004, RF-005, RF-006 | foco operativo, baja carga cognitiva, tiempo real |
| COF Workspace | hub + módulos de terminales, frecuencia, incidentes, KPIs y reportes | RF-005, RF-006, RF-007, RF-008 | síntesis, comparabilidad, exportabilidad |
| TI Workspace | hub + módulos de usuarios, permisos, auditoría y parámetros | RF-002 | seguridad, trazabilidad, control |

## 5. Interfaces de servicios SOA conceptuales

| Servicio | Contrato conceptual | Qué entrega | RF | NFR |
| --- | --- | --- | --- | --- |
| Fleet Context Service | `fleet.segment.snapshot` | buses, conductores y disponibilidad por terminal | RF-001, RF-002 | aislamiento, consistencia, respuesta rápida |
| Access Control Service | `scope.guard.profile` | rol, terminal asignado, acciones visibles | RF-002 | seguridad, auditoría |
| Charge Monitor Service | `energy.soc.readiness` | SoC, autonomía estimada, umbrales | RF-003 | actualización continua, alerta temprana |
| Departure Trace Service | `dispatch.geofence.departure` | eventos de salida por geocerca | RF-004 | exactitud temporal, trazabilidad |
| Frequency Alert Service | `frequency.alert.window` | brechas, atrasos críticos, prioridad | RF-005 | baja latencia, tiempo real |
| Incident Stream Service | `incident.timeline.feed` | incidentes, severidad, evidencia | RF-006 | observabilidad, respuesta rápida |
| Operations Insight Service | `kpi.executive.snapshot` | KPIs por terminal y US | RF-007 | comparabilidad, claridad |
| Report Export Service | `report.bundle.export` | paquetes PDF / Excel | RF-008 | portabilidad, auditabilidad |

## 6. Relación con puntos 6 y 7 del informe 2

### Punto 6

Se estructuran explícitamente las funcionalidades según:

- **componentes cliente**
- **componentes servicio**

### Punto 7

Se identifica para cada componente:

- interfaz visible o contrato conceptual
- requerimientos funcionales cubiertos
- atributos no funcionales relevantes

## 7. Limitaciones actuales del sistema visual

El sistema visual front-only NO implementa todavía:

- persistencia real
- endpoints reales
- autenticación real

Pero la base documental del informe 2 sí queda definida en `docs/informe2.md`, incluyendo:

- mecanismo de persistencia conceptual
- modelo lógico de datos
- diccionario de datos base

Eso se deja implementado solo a nivel documental en esta iteración.

## 8. Archivos fuente

- `lib/sicof-data.ts`
- `lib/sicof-navigation.ts`
- `lib/sicof-screen-data.ts`
- `app/page.tsx`
- `app/terminal/**/*.tsx`
- `app/cof/**/*.tsx`
- `app/admin/**/*.tsx`
- `app/terminal/layout.tsx`
- `app/cof/layout.tsx`
- `app/admin/layout.tsx`
- `docs/informe2.md`
