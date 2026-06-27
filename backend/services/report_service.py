"""
report_service.py — Servicio de Reportes SOA (nombre BUS: "repor")

Acciones:
  - get_operation_summary: KPIs agregados por terminal
  - get_terminal_health: salud operacional de todos los terminales
  - get_daily_report: reporte diario consolidado
  - get_kpis: indicadores clave de desempeño

RF asociados: RF-011 (Dashboard Gerencial), RF-012 (Exportación de Reportes)
"""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from soa_lib import connect_to_bus, send_message, receive_message, request_service
from db.connection import query

SERVICE_NAME = "repor"


def handle_get_operation_summary(params: dict) -> dict:
    """KPIs agregados por terminal o global."""
    terminal_id = params.get("terminal_id")

    # Obtener terminales desde el servicio de flota
    terminals_resp = request_service("flota", "get_terminals")
    if terminals_resp.get("status") != "ok":
        return {"status": "error", "message": "Error al obtener terminales del servicio de flota"}

    terminals = terminals_resp.get("data", [])
    if terminal_id:
        terminals = [t for t in terminals if t["id_terminal"] == terminal_id]

    summaries = []
    for t in terminals:
        tid = t["id_terminal"]

        # Obtener buses desde el servicio de flota
        buses_resp = request_service("flota", "get_buses", {"terminal_id": tid})
        buses = buses_resp.get("data", []) if buses_resp.get("status") == "ok" else []
        buses_total = len(buses)
        buses_electric = sum(1 for b in buses if b.get("tipo_energia") == "Eléctrico")

        # Obtener conductores desde el servicio de flota
        drivers_resp = request_service("flota", "get_conductors", {"terminal_id": tid})
        drivers = len(drivers_resp.get("data", [])) if drivers_resp.get("status") == "ok" else 0

        # Obtener asignaciones desde el servicio de flota
        assignments_resp = request_service("flota", "get_assignments", {"terminal_id": tid})
        active_assignments = len(assignments_resp.get("data", [])) if assignments_resp.get("status") == "ok" else 0

        # Obtener incidentes desde el servicio de incidentes
        incidents_resp = request_service("incid", "get_incidents", {"terminal_id": tid})
        incidents = incidents_resp.get("data", []) if incidents_resp.get("status") == "ok" else []
        open_incidents = sum(1 for i in incidents if i.get("estado") != "Cerrado")

        # Cumplimiento simulado basado en asignaciones vs buses
        compliance = round((active_assignments / max(buses_total, 1)) * 100, 1)
        availability = round(((buses_total - open_incidents) / max(buses_total, 1)) * 100, 1)

        tone = "green" if compliance > 95 else "orange" if compliance > 85 else "red"

        summaries.append({
            "terminal": t["nombre"],
            "terminal_id": tid,
            "buses_total": buses_total,
            "buses_electric": buses_electric,
            "drivers": drivers,
            "active_assignments": active_assignments,
            "open_incidents": open_incidents,
            "compliance": min(compliance, 100),
            "availability": min(availability, 100),
            "tone": tone,
        })

    return {"status": "ok", "data": summaries}


def handle_get_terminal_health(params: dict) -> dict:
    """Salud operacional comparativa entre terminales (para COF)."""
    result = handle_get_operation_summary({})
    if result["status"] != "ok":
        return result

    for t in result["data"]:
        t["risk"] = (
            "Alto" if t["open_incidents"] >= 3 else
            "Medio" if t["open_incidents"] >= 2 else
            "Bajo"
        )

    return result


def handle_get_kpis(params: dict) -> dict:
    """Indicadores KPI globales para el dashboard COF."""
    buses_resp = request_service("flota", "get_buses")
    buses = buses_resp.get("data", []) if buses_resp.get("status") == "ok" else []
    total_buses = len(buses)
    total_electric = sum(1 for b in buses if b.get("tipo_energia") == "Eléctrico")

    assignments_resp = request_service("flota", "get_assignments")
    active_assignments = len(assignments_resp.get("data", [])) if assignments_resp.get("status") == "ok" else 0

    incidents_resp = request_service("incid", "get_incidents")
    incidents = incidents_resp.get("data", []) if incidents_resp.get("status") == "ok" else []
    open_incidents = sum(1 for i in incidents if i.get("estado") != "Cerrado")
    critical_incidents = sum(1 for i in incidents if i.get("estado") == "Escalado" and i.get("severidad") in ("Alta", "Crítica"))

    terminals_resp = request_service("flota", "get_terminals")
    terminals_count = len(terminals_resp.get("data", [])) if terminals_resp.get("status") == "ok" else 0

    compliance = round((active_assignments / max(total_buses, 1)) * 100, 1)

    kpis = [
        {"label": "Cumplimiento salidas", "value": f"{min(compliance, 100)}%", "detail": "Consolidado actual", "tone": "green" if compliance > 95 else "orange"},
        {"label": "Terminales en foco", "value": f"{min(open_incidents, terminals_count)} / {terminals_count}", "detail": "Con incidentes abiertos", "tone": "orange" if open_incidents > 2 else "blue"},
        {"label": "Incidentes críticos", "value": f"{critical_incidents:02d}", "detail": "Escalados al COF", "tone": "red" if critical_incidents > 0 else "green"},
        {"label": "Flota eléctrica", "value": f"{total_electric}", "detail": f"De {total_buses} buses totales", "tone": "blue"},
    ]

    return {"status": "ok", "data": kpis}


def handle_get_daily_report(params: dict) -> dict:
    """Reporte diario consolidado."""
    terminal_id = params.get("terminal_id")

    report = {
        "generated_at": "2026-05-24T12:00:00",
        "type": "Reporte diario de operación",
        "format": params.get("format", "json"),
    }

    # Datos del reporte
    summary = handle_get_operation_summary({"terminal_id": terminal_id} if terminal_id else {})
    kpis = handle_get_kpis({})

    report["terminals"] = summary.get("data", [])
    report["kpis"] = kpis.get("data", [])

    # Incidentes del día obtenidos a través del servicio de incidentes
    incidents_resp = request_service("incid", "get_incidents")
    incidents = incidents_resp.get("data", []) if incidents_resp.get("status") == "ok" else []
    # Filtrar por terminal si corresponde
    if terminal_id:
        # Los incidentes devueltos por el servicio de incidentes ya tienen join con bus, que contiene id_terminal
        # Pero ojo, en la consulta de get_incidents, el select devuelve b.id_terminal? 
        # Espera, let's verify if b.id_terminal is returned in get_incidents SELECT statement.
        # En incident_service.py: SELECT i.*, b.patente, b.tipo_energia, c.nombre as conductor_nombre, t.nombre as terminal_nombre, etc.
        # Oh, it selects b.id_terminal as part of i.* if it joined or b.*? No, it selects i.* and b.patente, b.tipo_energia...
        # Wait, does it select b.id_terminal? No, b.id_terminal is not selected explicitly.
        # Wait, incident table doesn't have terminal_id, but it joined terminal t ON b.id_terminal = t.id_terminal.
        # So we can pass {"terminal_id": terminal_id} as a parameter directly to request_service("incid", "get_incidents")!
        # Yes! That is extremely clean and doesn't require filtering in Python!
        incidents_resp_filtered = request_service("incid", "get_incidents", {"terminal_id": terminal_id})
        incidents = incidents_resp_filtered.get("data", []) if incidents_resp_filtered.get("status") == "ok" else []

    report["incidents"] = incidents[:20]

    return {"status": "ok", "data": report}


def handle_get_report_catalog(params: dict) -> dict:
    """Catálogo de reportes disponibles."""
    catalog = [
        {"name": "Cumplimiento por terminal", "format": "PDF", "cadence": "06:30 / 12:30 / 18:30", "audience": "Gerencia + COF", "tone": "blue"},
        {"name": "Brechas de frecuencia", "format": "Excel", "cadence": "Cada 30 min", "audience": "COF + despacho", "tone": "orange"},
        {"name": "Incidentes críticos", "format": "PDF", "cadence": "Bajo demanda", "audience": "COF + auditoría", "tone": "red"},
        {"name": "Flota eléctrica y SoC", "format": "Excel", "cadence": "Cada 15 min", "audience": "Electroterminal + COF", "tone": "green"},
    ]
    return {"status": "ok", "data": catalog}



def handle_get_reports_list(params: dict) -> dict:
    """Retorna la lista de reportes disponibles para descarga."""
    rows = query("SELECT id_reporte, nombre, tipo, fecha_creacion, url_archivo, creador FROM reporte_descarga ORDER BY fecha_creacion DESC")
    return {"status": "ok", "data": rows}


def handle_request_report(params: dict) -> dict:
    """Crea una solicitud de reporte e inserta la descarga simulada en la base de datos."""
    import time
    nombre = params.get("nombre", "")
    tipo = params.get("tipo", "")
    creador = params.get("creador", "system")

    if not nombre or not tipo:
        return {"status": "error", "message": "Nombre y tipo requeridos"}

    fecha_creacion = time.strftime("%Y-%m-%dT%H:%M:%S")
    url_archivo = f"/downloads/reportes/{nombre}"

    query(
        "INSERT INTO reporte_descarga (nombre, tipo, fecha_creacion, url_archivo, creador) VALUES (?, ?, ?, ?, ?)",
        (nombre, tipo, fecha_creacion, url_archivo, creador)
    )

    # Registrar acción en auditoría mediante llamada interna (simulada o directa en DB)
    query(
        "INSERT INTO auditoria (username, accion, tabla_afectada, detalles, fecha_hora) VALUES (?, ?, ?, ?, ?)",
        (creador, "CREATE", "reporte_descarga", f"Generó reporte: {nombre} ({tipo})", fecha_creacion)
    )

    return {"status": "ok", "message": "Reporte generado correctamente"}


ACTIONS = {
    "get_operation_summary": handle_get_operation_summary,
    "get_terminal_health": handle_get_terminal_health,
    "get_kpis": handle_get_kpis,
    "get_daily_report": handle_get_daily_report,
    "get_report_catalog": handle_get_report_catalog,
    "get_reports_list": handle_get_reports_list,
    "request_report": handle_request_report,
}


def process_request(data: dict) -> dict:
    action = data.get("action", "")
    params = data.get("params", {})
    handler = ACTIONS.get(action)
    if not handler:
        return {"status": "error", "message": f"Acción '{action}' no reconocida"}
    try:
        return handler(params)
    except Exception as e:
        return {"status": "error", "message": f"Error: {str(e)}"}


def main() -> None:
    host = os.environ.get("SOA_BUS_HOST", "localhost")
    port = int(os.environ.get("SOA_BUS_PORT", "5000"))

    print(f"[{SERVICE_NAME}] Conectando al BUS en {host}:{port}...")
    sock = connect_to_bus(host, port)
    send_message(sock, "sinit", SERVICE_NAME)
    confirmation = receive_message(sock)
    print(f"[{SERVICE_NAME}] Registrado: {confirmation[5:].decode('utf-8')}")
    print(f"[{SERVICE_NAME}] Servicio listo.")

    try:
        while True:
            raw = receive_message(sock)
            payload_str = raw[5:].decode("utf-8")
            try:
                request_data = json.loads(payload_str)
            except json.JSONDecodeError:
                request_data = {"action": payload_str}
            print(f"[{SERVICE_NAME}] Request: {request_data.get('action', '?')}")
            response = process_request(request_data)
            send_message(sock, SERVICE_NAME, json.dumps(response, ensure_ascii=False))
    except KeyboardInterrupt:
        print(f"\n[{SERVICE_NAME}] Apagando...")
    except Exception as e:
        print(f"[{SERVICE_NAME}] Error: {e}")
    finally:
        sock.close()


if __name__ == "__main__":
    main()
