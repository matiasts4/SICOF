# SICOF · Informe 2 base en Markdown

## 1. Propósito de esta entrega

Este documento consolida la segunda entrega del proyecto SICOF a partir del trabajo ya realizado en `informe1.md` y del sistema visual front-only construido en Next.js.

La idea no es mezclar frontend bonito con humo técnico. La idea es cerrar correctamente los puntos **5, 6 y 7** pedidos en `InstruccionesInforme2.md`:

1. **mecanismo de persistencia**
2. **modelo de datos + diccionario**
3. **estructuración SOA en componentes cliente y servicio**
4. **interfaces de cada componente y RF/NFR cubiertos**

---

## 2. Corrección de enfoque respecto al estado anterior

En la iteración visual inicial se dejó explícitamente fuera:

- persistencia real
- base de datos real
- endpoints reales
- autenticación real

Eso fue correcto como estrategia de diseño, pero **no alcanza para cumplir el informe 2**.

Por eso, en esta versión se define:

- una **persistencia conceptual recomendada**
- un **modelo lógico de datos**
- un **diccionario base**
- la relación entre **clientes, servicios, interfaces y requerimientos**

Sin embargo, sigue siendo cierto que **no se implementa todavía** la base de datos ni los servicios backend. Se documentan para orientar la siguiente etapa técnica.

---

## 3. Punto 5 · Mecanismo de persistencia propuesto

### 3.1 Decisión

Se propone una arquitectura de persistencia **relacional centralizada**, apoyada por una base de datos SQL, porque SICOF necesita:

- relaciones claras entre buses, conductores, terminales y servicios
- trazabilidad de eventos operacionales
- consistencia en control de acceso por rol y terminal
- soporte para auditoría y reporting estructurado

### 3.2 Mecanismo recomendado

**Mecanismo principal:** base de datos relacional centralizada.

**Justificación:**

- RF-001 y RF-002 requieren relaciones estrictas entre usuarios, roles, terminales, buses y conductores.
- RF-004 y RF-006 requieren historial auditable de eventos e incidentes.
- RF-007 y RF-008 requieren consultas agregadas, comparables y exportables.
- El dominio tiene reglas de integridad que se modelan mejor en tablas relacionadas que en archivos planos.

### 3.3 Complementos de persistencia sugeridos

Además del almacenamiento relacional principal, el sistema podría apoyarse en:

- **bitácora de eventos operacionales** para salidas por geocerca, alertas e incidentes
- **almacenamiento de evidencias** (fotos o adjuntos) referenciado desde la base principal
- **tablas de resumen o vistas materializadas** para KPI y exportación de reportes

### 3.4 Qué NO se define todavía

En esta etapa no se fija aún:

- motor específico (PostgreSQL, SQL Server, etc.)
- estrategia exacta de particionado
- esquema final de replicación
- contratos API definitivos

Eso depende de la siguiente fase de diseño técnico y construcción.

---

## 4. Punto 5 · Modelo lógico de datos

## 4.1 Entidades principales

Las entidades base para SICOF son:

- **Terminal**
- **Bus**
- **Conductor**
- **Usuario**
- **Rol**
- **AsignacionOperativa**
- **EventoSalida**
- **RegistroSoC**
- **Incidente**
- **AlertaFrecuencia**
- **KpiOperacional**
- **ReporteExportado**

## 4.2 Relaciones clave

- Un **Terminal** tiene muchos **Buses**.
- Un **Terminal** tiene muchos **Conductores**.
- Un **Usuario** pertenece a un **Rol** y puede tener alcance sobre uno o varios **Terminales**.
- Una **AsignacionOperativa** vincula **Bus + Conductor + Terminal + Servicio** en una ventana operativa.
- Un **EventoSalida** pertenece a una **AsignacionOperativa**.
- Un **RegistroSoC** pertenece a un **Bus**.
- Un **Incidente** puede asociarse a **Bus**, **Conductor**, **Terminal** y/o **AsignacionOperativa**.
- Una **AlertaFrecuencia** se asocia a un **Servicio**, un **Terminal** y una ventana horaria.
- Un **KpiOperacional** resume métricas por **Terminal** y/o **Unidad de Servicio**.
- Un **ReporteExportado** registra generación, formato, período y estado.

---

## 5. Punto 5 · Diccionario de datos base

## 5.1 Terminal

| Campo | Tipo | Descripción |
| --- | --- | --- |
| terminal_id | UUID / entero | Identificador único del terminal |
| nombre | texto | Nombre del terminal |
| unidad_servicio | texto | Unidad de servicio asociada (US4, US6, etc.) |
| estado | texto | Estado operativo del terminal |

## 5.2 Bus

| Campo | Tipo | Descripción |
| --- | --- | --- |
| bus_id | UUID / entero | Identificador interno del bus |
| padron | texto | Código visible del vehículo |
| tipo_propulsion | texto | Diesel o eléctrico |
| terminal_id | FK | Terminal base del bus |
| estado_operativo | texto | Disponible, en patio, en mantención, asignado |

## 5.3 Conductor

| Campo | Tipo | Descripción |
| --- | --- | --- |
| conductor_id | UUID / entero | Identificador del conductor |
| nombre_completo | texto | Nombre visible |
| terminal_id | FK | Terminal base asignado |
| estado_turno | texto | Disponible, asignado, relevo, fuera de turno |

## 5.4 Usuario

| Campo | Tipo | Descripción |
| --- | --- | --- |
| usuario_id | UUID / entero | Identificador del usuario |
| nombre | texto | Nombre del usuario |
| rol_id | FK | Rol asignado |
| terminal_id | FK nullable | Terminal restringido cuando corresponda |
| activo | booleano | Estado de habilitación |

## 5.5 Rol

| Campo | Tipo | Descripción |
| --- | --- | --- |
| rol_id | UUID / entero | Identificador del rol |
| nombre | texto | Despachador, COF, TI |
| descripcion | texto | Alcance funcional del rol |

## 5.6 AsignacionOperativa

| Campo | Tipo | Descripción |
| --- | --- | --- |
| asignacion_id | UUID / entero | Identificador de la asignación |
| bus_id | FK | Bus asignado |
| conductor_id | FK | Conductor asignado |
| terminal_id | FK | Terminal responsable |
| servicio | texto | Servicio o recorrido |
| hora_programada_salida | timestamp | Hora teórica de salida |
| estado | texto | Preparación, listo, despachado, cancelado |

## 5.7 EventoSalida

| Campo | Tipo | Descripción |
| --- | --- | --- |
| evento_salida_id | UUID / entero | Identificador del evento |
| asignacion_id | FK | Asignación asociada |
| timestamp_salida | timestamp | Hora efectiva detectada |
| origen | texto | Manual, GPS, geocerca |
| observacion | texto | Comentario opcional |

## 5.8 RegistroSoC

| Campo | Tipo | Descripción |
| --- | --- | --- |
| soc_id | UUID / entero | Identificador del registro |
| bus_id | FK | Bus eléctrico asociado |
| porcentaje_soc | decimal | Nivel de batería |
| autonomia_estimada_km | decimal | Autonomía proyectada |
| timestamp_lectura | timestamp | Momento de lectura |

## 5.9 Incidente

| Campo | Tipo | Descripción |
| --- | --- | --- |
| incidente_id | UUID / entero | Identificador del incidente |
| tipo | texto | Falla mecánica, accidente, contingencia, etc. |
| severidad | texto | Baja, media, alta, crítica |
| bus_id | FK nullable | Bus afectado |
| conductor_id | FK nullable | Conductor involucrado |
| terminal_id | FK | Terminal donde se origina o reporta |
| descripcion | texto | Detalle del incidente |
| evidencia_url | texto nullable | Referencia a adjunto |
| estado | texto | Abierto, monitoreado, escalado, cerrado |

## 5.10 AlertaFrecuencia

| Campo | Tipo | Descripción |
| --- | --- | --- |
| alerta_id | UUID / entero | Identificador de la alerta |
| terminal_id | FK | Terminal relacionado |
| servicio | texto | Servicio afectado |
| brecha_minutos | decimal | Diferencia respecto a meta |
| nivel | texto | Preventiva, crítica |
| timestamp_alerta | timestamp | Momento de emisión |

## 5.11 KpiOperacional

| Campo | Tipo | Descripción |
| --- | --- | --- |
| kpi_id | UUID / entero | Identificador del KPI |
| terminal_id | FK nullable | Terminal asociado |
| unidad_servicio | texto nullable | Unidad de servicio |
| nombre_kpi | texto | Cumplimiento, disponibilidad, puntualidad, etc. |
| valor | decimal | Valor de la métrica |
| timestamp_corte | timestamp | Fecha/hora del corte |

## 5.12 ReporteExportado

| Campo | Tipo | Descripción |
| --- | --- | --- |
| reporte_id | UUID / entero | Identificador del reporte |
| nombre | texto | Nombre del reporte |
| formato | texto | PDF o Excel |
| periodo_desde | timestamp | Inicio del período |
| periodo_hasta | timestamp | Fin del período |
| estado | texto | En cola, disponible, generado |
| generado_por | FK | Usuario que dispara o configura el reporte |

---

## 6. Punto 6 · Estructuración SOA de funcionalidades

La arquitectura SOA se organiza separando claramente:

- **componentes cliente**: donde cada rol consume información y ejecuta acciones
- **componentes servicio**: donde vive la lógica de negocio y exposición de contratos

## 6.1 Componentes cliente

| Componente cliente | Propósito principal | Ruta actual del sistema visual |
| --- | --- | --- |
| Centro Operacional SICOF | comunicar el mapa completo del sistema y abrir workspaces por rol | `/` |
| Terminal Workspace | despacho por terminal, flota, SoC, salida, frecuencia e incidentes | `/terminal` + subrutas `/terminal/*` |
| COF Workspace | visión global, comparación entre patios, KPIs e exportación | `/cof` + subrutas `/cof/*` |
| TI Workspace | permisos, auditoría, usuarios y parametrización | `/admin` + subrutas `/admin/*` |

## 6.2 Componentes servicio

| Componente servicio | Contrato conceptual | Responsabilidad |
| --- | --- | --- |
| Fleet Context Service | `fleet.segment.snapshot` | entregar contexto operativo filtrado por terminal |
| Access Control Service | `scope.guard.profile` | resolver rol, alcance y permisos visibles |
| Charge Monitor Service | `energy.soc.readiness` | consolidar SoC, autonomía y alertas de energía |
| Departure Trace Service | `dispatch.geofence.departure` | registrar y publicar salida automática |
| Frequency Alert Service | `frequency.alert.window` | detectar brechas e incumplimientos de frecuencia |
| Incident Stream Service | `incident.timeline.feed` | publicar incidentes, severidad y evidencia |
| Operations Insight Service | `kpi.executive.snapshot` | exponer KPIs operacionales agregados |
| Report Export Service | `report.bundle.export` | preparar y registrar exportación de reportes |

---

## 7. Punto 7 · Interfaces por componente y RF/NFR cubiertos

## 7.1 Componentes cliente

| Componente | Interfaz | RF cubiertos | NFR relevantes |
| --- | --- | --- | --- |
| Landing / Fleet Narrative | overview del sistema y mapa de módulos | RF-001, RF-005, RF-007 | claridad, onboarding, consistencia |
| Terminal Operations Board | panel de despacho en tiempo real | RF-001, RF-003, RF-004, RF-005 | foco operativo, baja carga cognitiva, tiempo real |
| COF Pulse Dashboard | cockpit multi-terminal | RF-005, RF-006, RF-007, RF-008 | síntesis, comparabilidad, exportabilidad |
| Access Scope Console | consola de políticas y auditoría | RF-002 | seguridad, trazabilidad, control |

## 7.2 Componentes servicio

| Servicio | Interfaz / contrato | RF cubiertos | NFR relevantes |
| --- | --- | --- | --- |
| Fleet Context Service | `fleet.segment.snapshot` | RF-001, RF-002 | aislamiento por terminal, respuesta consistente |
| Access Control Service | `scope.guard.profile` | RF-002 | seguridad, auditoría |
| Charge Monitor Service | `energy.soc.readiness` | RF-003 | actualización continua, alerta temprana |
| Departure Trace Service | `dispatch.geofence.departure` | RF-004 | exactitud temporal, trazabilidad |
| Frequency Alert Service | `frequency.alert.window` | RF-005 | baja latencia, priorización |
| Incident Stream Service | `incident.timeline.feed` | RF-006 | observabilidad, respuesta rápida |
| Operations Insight Service | `kpi.executive.snapshot` | RF-007 | comparabilidad, claridad |
| Report Export Service | `report.bundle.export` | RF-008 | portabilidad, auditabilidad |

---

## 8. Relación con el sistema visual construido

El sistema visual actual implementa estas relaciones en:

- `app/page.tsx`
- `app/terminal/**/*.tsx`
- `app/cof/**/*.tsx`
- `app/admin/**/*.tsx`
- `docs/module-coverage.md`
- `docs/visual-design-system.md`

Eso significa que el informe no está desconectado del frontend. Al contrario: la interfaz ya sirve como evidencia narrativa de cómo se separan responsabilidades por rol y por servicio.

---

## 9. Estado del proyecto después de esta base

### Queda resuelto en documentación

- persistencia conceptual
- modelo lógico base
- diccionario de datos inicial
- separación cliente / servicio bajo SOA
- contratos conceptuales por servicio
- trazabilidad RF / NFR / interfaz

### Queda pendiente para la siguiente fase técnica

- implementación real del backend
- creación de base de datos
- endpoints concretos
- autenticación real
- integración GPS / SoC / reportes externos

---

## 10. Conclusión

SICOF ya no está solamente en una etapa “bonita” de frontend. Con esta base, el proyecto queda alineado con lo exigido para el informe 2:

- se define cómo persistir
- se define qué datos sostienen la operación
- se estructuran clientes y servicios SOA
- se explican interfaces, RF y NFR por componente

Eso ordena la conversación técnica y deja una transición sana hacia implementación real.
