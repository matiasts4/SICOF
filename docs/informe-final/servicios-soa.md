# Documentación de Servicios SOA y Procesos Cliente

Este documento describe formalmente la especificación y contratos de la arquitectura Orientada a Servicios (SOA) del sistema **SICOF** (Sistema Integral de Control de Flotas), construida enteramente sobre sockets **TCP/IP nativos** a través de un **Bus ESB central**.

---

## 1. Arquitectura de Comunicación TCP

Todos los servicios y clientes se comunican utilizando el mismo protocolo de trama TCP de tres segmentos:

```
[LONGITUD (5 bytes)][SERVICIO (5 bytes)][PAYLOAD JSON]
```

- **LONGITUD**: 5 bytes ASCII que indican la longitud total en bytes del segmento `[SERVICIO] + [PAYLOAD JSON]`.
- **SERVICIO**: 5 bytes ASCII rellenos con espacios si es necesario (ej: `flota`, `segur`, `gpssv`, `carga`, `frecu`, `incid`, `repor`).
- **PAYLOAD JSON**: Objeto JSON con la acción a ejecutar y sus parámetros, codificado en UTF-8.

---

## 2. Definición de Servicios SOA (7 Componentes)

### 2.1 Servicio `segur` (Seguridad)
- **Propósito**: Gestión de credenciales, autenticación de usuarios y emisión/validación de tokens JWT.
- **RF Cubiertos**: RF-003 (Control de Acceso por Terminal).
- **Acciones Disponibles**:
  - `login`: `{ "username": "cpizarro", "password": "..." }` → `{ "status": "ok", "token": "...", "user": {...} }`
  - `validate`: `{ "token": "..." }` → `{ "status": "ok", "user": {...} }`
  - `list_users`: `{ "terminal_id": 1 }` (opcional) → `{ "status": "ok", "data": [...] }`
- **Ejemplo Trama TCP**:
  - *Solicitud*: `00072segur{"action": "login", "params": {"username": "cpizarro", "password": "sicof2026"}}`
  - *Respuesta*: `00192segur{"status": "ok", "token": "h.p.s", "user": {"id": 1, "username": "cpizarro", "nombre": "Carla Pizarro", "rol": "Despachador", "terminal_id": 1}}`
- **Código Fuente Relevante** (Handler Principal):
  ```python
  def handle_login(params: dict) -> dict:
      username = params.get("username", "")
      password = params.get("password", "")
      users = query("SELECT * FROM usuario WHERE username = ? AND activo = 1", (username,))
      if not users:
          return {"status": "error", "message": "Credenciales inválidas"}
      user = users[0]
      if password != "sicof2026":
          pwd_hash = hash_password(password)
          if pwd_hash != user["password_hash"]:
              return {"status": "error", "message": "Credenciales inválidas"}
      token = create_token({
          "user_id": user["id_usuario"], "username": user["username"],
          "nombre": user["nombre"], "rol": user["rol"], "terminal_id": user["id_terminal"]
      })
      return {"status": "ok", "token": token, "user": {...}}
  ```

---

### 2.2 Servicio `flota` (Gestión de Flota)
- **Propósito**: CRUD de buses, conductores y asignaciones operativas en patio.
- **RF Cubiertos**: RF-001 (Registro de Flota por Terminal), RF-002 (Segmentación de Patio).
- **Acciones Disponibles**:
  - `get_buses`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": [...] }`
  - `get_conductors`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": [...] }`
  - `get_assignments`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": [...] }`
  - `create_assignment`: `{ "id_bus": 1, "id_conductor": 1, "id_terminal": 1, "id_ruta": 1, ... }` → `{ "status": "ok", "id_asignacion": X }`
  - `get_segments`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": [...] }`
- **Ejemplo Trama TCP**:
  - *Solicitud*: `00057flota{"action": "get_buses", "params": {"terminal_id": 1}}`
  - *Respuesta*: `00210flota{"status": "ok", "data": [{"id_bus": 1, "patente": "EB-214", "tipo_energia": "Eléctrico", "modelo": "Yutong E12", "id_terminal": 1}], "count": 1}`

---

### 2.3 Servicio `gpssv` (Monitoreo GPS)
- **Propósito**: Ingesta de posiciones georeferenciadas y control de geocercas por terminal.
- **RF Cubiertos**: RF-005 (Marcaje Automático de Salida), RF-006 (Hitos de Geocerca).
- **Acciones Disponibles**:
  - `register_position`: `{ "id_bus": 1, "lat": -33.35, "lon": -70.73, "speed": 10 }` → `{ "status": "ok" }`
  - `get_position`: `{ "id_bus": 1 }` → `{ "status": "ok", "data": {...} }`
  - `check_geofence`: `{ "id_bus": 1 }` → `{ "status": "ok", "inside": true/false }`

---

### 2.4 Servicio `carga` (Estado de Carga - SoC)
- **Propósito**: Monitoreo de estado de carga, autonomía y bahías para buses eléctricos.
- **RF Cubiertos**: RF-004 (Monitoreo de Carga SoC).
- **Acciones Disponibles**:
  - `register_charge`: `{ "id_bus": 1, "nivel_carga": 85.0 }` → `{ "status": "ok" }`
  - `get_charge`: `{ "id_bus": 1 }` → `{ "status": "ok", "data": {...} }`
  - `get_alerts`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": [...] }`
  - `get_charger_status`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": [...] }`
  - `get_terminal_summary`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": {...} }`

---

### 2.5 Servicio `frecu` (Control de Frecuencia)
- **Propósito**: Cálculo de regularidad, intervalos entre buses (headway) y brechas.
- **RF Cubiertos**: RF-007 (Tablero de Intervalos), RF-008 (Alertas de Frecuencia).
- **Acciones Disponibles**:
  - `get_intervals`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": [...] }`
  - `get_alerts`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": [...] }`
  - `get_corridor_status`: `{}` → `{ "status": "ok", "data": [...] }`

---

### 2.6 Servicio `incid` (Incidentes)
- **Propósito**: Registro de anomalías viales, mecánicas o de carga, y escalamiento local/global.
- **RF Cubiertos**: RF-009 (Registro de Incidentes), RF-010 (Asociación a Contexto).
- **Acciones Disponibles**:
  - `create_incident`: `{ "id_bus": 1, "tipo": "Vial", "severidad": "Alta", "descripcion": "..." }` → `{ "status": "ok", "id_incidente": 1 }`
  - `update_incident`: `{ "id_incidente": 1, "estado": "Escalado" }` → `{ "status": "ok" }`
  - `get_incidents`: `{ "terminal_id": 1 }` (opcional) → `{ "status": "ok", "data": [...] }`
  - `get_severity_summary`: `{ "terminal_id": 1 }` → `{ "status": "ok", "data": {...} }`

---

### 2.7 Servicio `repor` (Reportes)
- **Propósito**: Cálculo de KPIs consolidados e información gerencial para administración.
- **RF Cubiertos**: RF-011 (Dashboard Gerencial), RF-012 (Exportación de Reportes).
- **Acciones Disponibles**:
  - `get_operation_summary`: `{}` → `{ "status": "ok", "data": [...] }`
  - `get_terminal_health`: `{}` → `{ "status": "ok", "data": [...] }`
  - `get_kpis`: `{}` → `{ "status": "ok", "data": [...] }`
  - `get_report_catalog`: `{}` → `{ "status": "ok", "data": [...] }`

---

## 3. Interfaces de Componentes Cliente (3 Procesos Cliente)

### 3.1 Proceso Cliente 1: Despachador de Terminal
- **Rol**: Gestionar la micro-operación en el patio asignado.
- **Servicios SOA Consumidos**: `flota`, `carga`, `gpssv`, `frecu`, `incid` (vía BUS TCP).
- **Flujo de Uso Típico**:
  1. **Autenticación**: El despachador inicia sesión en la pantalla local (`/login`). El cliente Next.js envía una solicitud `login` al servicio `segur`.
  2. **Monitoreo de Patio**: Consulta el inventario segmentado del patio (`get_segments` y `get_buses` en `flota`).
  3. **Control SoC**: El cliente consulta periódicamente `get_alerts` en `carga` para verificar que las unidades eléctricas tengan autonomía suficiente.
  4. **Salida/Geocerca**: Registra la salida en la cola (`get_assignments`) y el servicio `gpssv` detecta automáticamente el cruce de geocerca del terminal (`check_geofence`).
  5. **Incidentes**: Si se detecta un sensor con fallas o colisión, registra el incidente con `create_incident` en `incid` asociando bus y conductor.

---

### 3.2 Proceso Cliente 2: Administrador COF (Centro de Operaciones y Flota)
- **Rol**: Supervisión global multi-terminal y decisiones estratégicas/regulación de frecuencia.
- **Servicios SOA Consumidos**: `carga`, `frecu`, `incid`, `repor` (vía BUS TCP).
- **Flujo de Uso Típico**:
  1. **Acceso Global**: Inicia sesión. Al tener rol `Admin COF`, accede directamente al dashboard ejecutivo (`/cof`).
  2. **Monitoreo de Red**: Visualiza el estado agregado de regularidad de los corredores (`get_corridor_status` en `frecu`).
  3. **Gestión de Contingencias**: Revisa incidentes críticos de severidad "Alta" o "Crítica" escalados por los terminales (`get_incidents` en `incid`).
  4. **Toma de Decisiones**: Genera swaps de buses o coordina desvíos tácticos.
  5. **Análisis y Reportes**: Consulta KPIs consolidados y exporta packs ejecutivos diarios (`get_kpis` y `get_daily_report` en `repor`).

---

### 3.3 Proceso Cliente 3: Administrador TI
- **Rol**: Gestión de seguridad, trazabilidad de accesos y parametrización sistémica.
- **Servicios SOA Consumidos**: `segur`, `flota` (vía BUS TCP).
- **Flujo de Uso Típico**:
  1. **Consola TI**: Accede a `/admin` con credenciales de `Admin TI`.
  2. **Gobierno de Usuarios**: Lista y gestiona los usuarios activos e inactivos del sistema (`list_users` en `segur`).
  3. **Salud del Sistema**: Verifica el estado de registro y disponibilidad de los servicios en el BUS.
  4. **Auditoría**: Consulta bitácoras de auditoría de seguridad y modifica rangos de operación.
