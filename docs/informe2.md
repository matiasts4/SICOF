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

La arquitectura SOA se organiza separando claramente **componentes cliente** y **componentes servicio**, comunicados exclusivamente mediante **sockets TCP/IP nativos** a través de un **Bus ESB centralizado** (puerto 5000).

### 6.1 Componentes cliente

| Componente cliente | Propósito principal | Servicios SOA consumidos (vía BUS TCP) |
| --- | --- | --- |
| Cliente Despachador | Despacho por terminal, flota, SoC, salida, frecuencia e incidentes | `flota`, `carga`, `gpssv`, `frecu`, `incid` |
| Cliente Administrador COF | Visión global, comparación entre patios, KPIs y exportación | `carga`, `frecu`, `repor`, `incid` |
| Cliente Administrador TI | Permisos, auditoría, usuarios y parametrización | `segur`, `flota` |

### 6.2 Componentes servicio

Cada servicio se registra en el BUS mediante un nombre de exactamente **5 caracteres** y se comunica mediante el protocolo TCP de 3 segmentos: `[LONGITUD(5)][SERVICIO(5)][PAYLOAD_JSON]`.

| Servicio | Nombre BUS | Responsabilidad | RF asociados |
| --- | --- | --- | --- |
| Servicio de Seguridad | `segur` | Autenticación JWT, autorización por rol y terminal | RF-003 |
| Servicio de Gestión de Flota | `flota` | CRUD de buses, conductores, asignaciones, segmentos por terminal | RF-001, RF-002 |
| Servicio de Monitoreo GPS | `gpssv` | Registro de posiciones, detección de geocerca para salida automática | RF-005, RF-006 |
| Servicio de Estado de Carga | `carga` | Monitoreo SoC, alertas por umbral, estado de bahías de carga | RF-004 |
| Servicio de Control de Frecuencia | `frecu` | Cálculo de intervalos, alertas de desviación, estado de corredores | RF-007, RF-008 |
| Servicio de Incidentes | `incid` | Registro, escalamiento, consulta y contexto operativo de incidentes | RF-009, RF-010 |
| Servicio de Reportes | `repor` | KPIs, salud de terminales, reportes consolidados, catálogo de exportación | RF-011, RF-012 |

### 6.3 Persistencia

Se utiliza una **base de datos relacional centralizada compartida** entre todos los servicios. La decisión de persistencia compartida (vs. independiente por servicio) se justifica porque múltiples servicios necesitan integridad referencial cruzada (ej: un incidente referencia un bus, un conductor y un terminal que son gestionados por el servicio de flota). Ver sección de persistencia para detalle completo.

---

## 7. Punto 7 · Interfaces por componente y RF/NFR cubiertos

### 7.1 Componentes cliente

| Componente | Interfaz | RF cubiertos | NFR relevantes |
| --- | --- | --- | --- |
| Cliente Despachador | Panel de despacho: flota, asignaciones, SoC, frecuencias, incidentes por terminal | RF-001 a RF-010 | Respuesta < 2s, disponibilidad 99,5%, usabilidad sin capacitación |
| Cliente Administrador COF | Dashboard multi-terminal: KPIs, brechas de frecuencia, incidentes críticos, reportes | RF-004, RF-007 a RF-012 | Carga < 3s con 930 buses, 20 usuarios concurrentes |
| Cliente Administrador TI | Consola de gobierno: usuarios, roles, auditoría, configuración | RF-003 | Trazabilidad completa, seguridad de datos |

### 7.2 Componentes servicio — Contratos de mensajes

Cada servicio expone sus operaciones como **acciones JSON** transportadas por el BUS TCP. A continuación se detallan los contratos principales:

**Servicio `segur`** (Seguridad):
- `login` → recibe `{username, password}` → retorna `{token, user}` con JWT
- `validate` → recibe `{token}` → retorna `{user}` con rol y terminal
- `list_users` → recibe `{terminal_id?}` → retorna lista de usuarios

**Servicio `flota`** (Gestión de Flota):
- `get_buses` → recibe `{terminal_id?}` → retorna lista de buses con tipo de energía
- `get_conductors` → recibe `{terminal_id?}` → retorna lista de conductores
- `get_assignments` → recibe `{terminal_id?}` → retorna asignaciones activas
- `create_assignment` → recibe `{id_bus, id_conductor, id_terminal, id_ruta, fecha_hora_inicio}` → retorna ID de asignación
- `get_segments` → recibe `{terminal_id}` → retorna segmentos del patio (andén eléctrico, troncal, reserva)
- `get_terminals` → retorna lista de todos los terminales

**Servicio `gpssv`** (Monitoreo GPS):
- `register_position` → recibe `{id_bus, lat, lon, speed, timestamp}` → confirma registro
- `get_fleet_positions` → recibe `{terminal_id?}` → retorna última posición de cada bus
- `check_geofence` → recibe `{id_bus}` → retorna si el bus está dentro/fuera de la geocerca del terminal

**Servicio `carga`** (Estado de Carga):
- `get_charge` → recibe `{id_bus}` → retorna SoC actual con clasificación (Suficiente/Advertencia/Crítico)
- `get_alerts` → recibe `{terminal_id}` → retorna buses con carga bajo umbral (< 50%)
- `get_charger_status` → recibe `{terminal_id}` → retorna estado de bahías de carga

**Servicio `frecu`** (Control de Frecuencia):
- `get_intervals` → recibe `{terminal_id?}` → retorna intervalos actuales vs programados por ruta
- `get_alerts` → recibe `{terminal_id}` → retorna solo brechas que superan umbral
- `get_corridor_status` → retorna estado agregado por corredor (US4/US6)

**Servicio `incid`** (Incidentes):
- `create_incident` → recibe `{id_bus, tipo, severidad, descripcion, lat, lon, fecha_hora}` → retorna ID
- `update_incident` → recibe `{id_incidente, estado}` → confirma actualización (Abierto → Escalado → Cerrado)
- `get_incidents` → recibe `{terminal_id?, id_bus?, estado?}` → retorna lista filtrada

**Servicio `repor`** (Reportes):
- `get_kpis` → retorna indicadores clave globales (cumplimiento, incidentes, flota eléctrica)
- `get_operation_summary` → recibe `{terminal_id?}` → retorna KPIs por terminal
- `get_daily_report` → recibe `{terminal_id?, format?}` → retorna reporte diario consolidado

Todos los contratos retornan `{"status":"ok", "data":...}` en caso de éxito o `{"status":"error", "message":"..."}` en caso de fallo.

### 7.3 Trazabilidad RF → Servicio

| RF | Descripción | Servicio SOA |
| --- | --- | --- |
| RF-001 | Registro de Flota por Terminal | `flota` |
| RF-002 | Segmentación Operativa por Patio | `flota` |
| RF-003 | Control de Acceso por Terminal | `segur` |
| RF-004 | Monitoreo de Carga (SoC) | `carga` |
| RF-005 | Detección de Geocerca de Salida | `gpssv` |
| RF-006 | Registro Automático de Salida | `gpssv` |
| RF-007 | Tablero de Intervalos en Tiempo Real | `frecu` |
| RF-008 | Alertas de Frecuencia | `frecu` |
| RF-009 | Registro de Incidentes | `incid` |
| RF-010 | Asociación de Incidentes a Contexto | `incid` |
| RF-011 | Dashboard Gerencial | `repor` |
| RF-012 | Exportación de Reportes | `repor` |

---

## 8. Relación con el sistema implementado

El sistema SICOF actualmente implementa esta arquitectura con código funcional:

- **Bus ESB**: `backend/soa_bus.py` — Router TCP en puerto 5000
- **Librería SOA**: `backend/soa_lib.py` — Protocolo de comunicación
- **7 servicios**: `backend/services/` — Cada uno registrado con nombre de 5 caracteres
- **Base de datos**: `backend/db/schema.sql` + `backend/db/seed.sql` — 9 tablas, datos coherentes
- **Tests**: `backend/test_soa.py` — Validación de todos los servicios vía BUS TCP

---

## 9. Conclusión

SICOF implementa una arquitectura SOA completa basada en sockets TCP/IP nativos, con un Bus ESB centralizado como punto único de comunicación entre clientes y servicios. La base de datos relacional compartida garantiza integridad referencial y consistencia transaccional. Cada requerimiento funcional (RF-001 a RF-012) tiene un servicio SOA responsable con contratos de mensajes definidos y verificados.
