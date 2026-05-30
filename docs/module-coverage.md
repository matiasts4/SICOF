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

| RF | Módulo visual | Cliente | Servicio SOA (BUS TCP) | Ruta |
| --- | --- | --- | --- | --- |
| RF-001 | Registro de flota por terminal | Cliente Despachador | `flota` | `/terminal`, `/terminal/flota` |
| RF-002 | Segmentación operativa por patio | Cliente Despachador | `flota` | `/terminal`, `/terminal/flota` |
| RF-003 | Control de acceso por terminal | Todos | `segur` | `/admin`, `/admin/usuarios`, `/admin/permisos` |
| RF-004 | Monitoreo de carga (SoC) | Cliente Despachador / COF | `carga` | `/terminal/energia`, `/cof` |
| RF-005 | Detección de geocerca de salida | Cliente Despachador | `gpssv` | `/terminal/despacho` |
| RF-006 | Registro automático de salida | Cliente Despachador | `gpssv` | `/terminal/despacho` |
| RF-007 | Tablero de intervalos en tiempo real | Cliente Despachador / COF | `frecu` | `/terminal/frecuencia`, `/cof/frecuencia` |
| RF-008 | Alertas de frecuencia | Cliente Despachador / COF | `frecu` | `/terminal/frecuencia`, `/cof/frecuencia` |
| RF-009 | Registro de incidentes | Cliente Despachador / COF | `incid` | `/terminal/incidentes`, `/cof/incidentes` |
| RF-010 | Asociación de incidentes a contexto | Cliente Despachador / COF | `incid` | `/terminal/incidentes`, `/cof/incidentes` |
| RF-011 | Dashboard gerencial | Cliente COF | `repor` | `/cof`, `/cof/terminales`, `/cof/kpis` |
| RF-012 | Exportación de reportes | Cliente COF | `repor` | `/cof/reportes` |

## 4. Interfaces cliente visibles

| Cliente | Interfaz | RF | NFR priorizados |
| --- | --- | --- | --- |
| Centro Operacional SICOF | lobby visual y quick launch | RF-001, RF-007, RF-011 | claridad, onboarding, consistencia |
| Cliente Despachador | hub + módulos de flota, despacho, energía, frecuencia e incidentes | RF-001 a RF-010 | foco operativo, baja carga cognitiva, tiempo real |
| Cliente COF | hub + módulos de terminales, frecuencia, incidentes, KPIs y reportes | RF-004, RF-007 a RF-012 | síntesis, comparabilidad, exportabilidad |
| Cliente TI | hub + módulos de usuarios, permisos, auditoría y parámetros | RF-003 | seguridad, trazabilidad, control |

## 5. Interfaces de servicios SOA (comunicación vía BUS TCP, sockets nativos)

| Servicio | Nombre BUS | Qué entrega | RF | NFR |
| --- | --- | --- | --- | --- |
| Servicio de Seguridad | `segur` | Tokens JWT, perfiles de usuario, validación de sesión | RF-003 | seguridad, auditoría |
| Servicio de Gestión de Flota | `flota` | Buses, conductores, asignaciones, segmentos por terminal | RF-001, RF-002 | aislamiento, consistencia, respuesta rápida |
| Servicio de Monitoreo GPS | `gpssv` | Posiciones en tiempo real, detección de geocerca | RF-005, RF-006 | exactitud temporal, trazabilidad |
| Servicio de Estado de Carga | `carga` | SoC, autonomía estimada, alertas por umbral | RF-004 | actualización continua, alerta temprana |
| Servicio de Control de Frecuencia | `frecu` | Intervalos, brechas, alertas, estado de corredores | RF-007, RF-008 | baja latencia, tiempo real |
| Servicio de Incidentes | `incid` | Incidentes, severidad, evidencia, contexto operativo | RF-009, RF-010 | observabilidad, respuesta rápida |
| Servicio de Reportes | `repor` | KPIs por terminal, reportes consolidados, exportación | RF-011, RF-012 | portabilidad, auditabilidad |

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
