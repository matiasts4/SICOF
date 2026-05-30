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

from soa_lib import connect_to_bus, send_message, receive_message
from db.connection import query

SERVICE_NAME = "repor"


def handle_get_operation_summary(params: dict) -> dict:
    """KPIs agregados por terminal o global."""
    terminal_id = params.get("terminal_id")

    if terminal_id:
        terminals = query("SELECT * FROM terminal WHERE id_terminal = ?", (terminal_id,))
    else:
        terminals = query("SELECT * FROM terminal")

    summaries = []
    for t in terminals:
        tid = t["id_terminal"]

        buses_total = query("SELECT COUNT(*) as c FROM bus WHERE id_terminal = ? AND activo = 1", (tid,))[0]["c"]
        buses_electric = query(
            "SELECT COUNT(*) as c FROM bus WHERE id_terminal = ? AND tipo_energia = 'Eléctrico' AND activo = 1",
            (tid,),
        )[0]["c"]
        drivers = query("SELECT COUNT(*) as c FROM conductor WHERE id_terminal = ? AND activo = 1", (tid,))[0]["c"]
        active_assignments = query(
            "SELECT COUNT(*) as c FROM asignacion WHERE id_terminal = ? AND fecha_hora_fin IS NULL", (tid,),
        )[0]["c"]
        open_incidents = query(
            """SELECT COUNT(*) as c FROM incidente i
               JOIN bus b ON i.id_bus = b.id_bus
               WHERE b.id_terminal = ? AND i.estado != 'Cerrado'""",
            (tid,),
        )[0]["c"]

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
    total_buses = query("SELECT COUNT(*) as c FROM bus WHERE activo = 1")[0]["c"]
    total_electric = query("SELECT COUNT(*) as c FROM bus WHERE tipo_energia = 'Eléctrico' AND activo = 1")[0]["c"]
    active_assignments = query("SELECT COUNT(*) as c FROM asignacion WHERE fecha_hora_fin IS NULL")[0]["c"]
    open_incidents = query("SELECT COUNT(*) as c FROM incidente WHERE estado != 'Cerrado'")[0]["c"]
    critical_incidents = query(
        "SELECT COUNT(*) as c FROM incidente WHERE estado = 'Escalado' AND severidad IN ('Alta', 'Crítica')"
    )[0]["c"]
    terminals_count = query("SELECT COUNT(*) as c FROM terminal")[0]["c"]

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

    # Incidentes del día
    incidents = query(
        """SELECT i.*, b.patente, t.nombre as terminal_nombre
           FROM incidente i
           JOIN bus b ON i.id_bus = b.id_bus
           JOIN terminal t ON b.id_terminal = t.id_terminal
           ORDER BY i.fecha_hora DESC LIMIT 20"""
    )
    report["incidents"] = incidents

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


ACTIONS = {
    "get_operation_summary": handle_get_operation_summary,
    "get_terminal_health": handle_get_terminal_health,
    "get_kpis": handle_get_kpis,
    "get_daily_report": handle_get_daily_report,
    "get_report_catalog": handle_get_report_catalog,
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
