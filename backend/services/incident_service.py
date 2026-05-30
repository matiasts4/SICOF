"""
incident_service.py — Servicio de Incidentes SOA (nombre BUS: "incid")

Acciones:
  - create_incident: nuevo incidente con bus, conductor, ubicación
  - update_incident: cambiar estado (Abierto → Escalado → Cerrado)
  - get_incidents: listar por terminal, bus o fecha
  - get_incident_detail: detalle con toda la info asociada
  - get_severity_summary: conteo por severidad

RF asociados: RF-009 (Registro de Incidentes), RF-010 (Asociación a Contexto)
"""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from soa_lib import connect_to_bus, send_message, receive_message
from db.connection import query, execute

SERVICE_NAME = "incid"


def handle_create_incident(params: dict) -> dict:
    required = ["id_bus", "tipo", "descripcion", "fecha_hora"]
    for f in required:
        if f not in params:
            return {"status": "error", "message": f"Campo '{f}' requerido"}

    new_id = execute(
        """INSERT INTO incidente (id_bus, id_conductor, tipo, severidad, descripcion,
               coordenada_lat, coordenada_lon, url_evidencia, estado, fecha_hora)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Abierto', ?)""",
        (
            params["id_bus"],
            params.get("id_conductor"),
            params["tipo"],
            params.get("severidad", "Media"),
            params["descripcion"],
            params.get("lat"),
            params.get("lon"),
            params.get("url_evidencia"),
            params["fecha_hora"],
        ),
    )

    return {"status": "ok", "id_incidente": new_id, "message": "Incidente registrado"}


def handle_update_incident(params: dict) -> dict:
    inc_id = params.get("id_incidente")
    new_state = params.get("estado")
    if not inc_id or not new_state:
        return {"status": "error", "message": "id_incidente y estado requeridos"}

    valid_states = ["Abierto", "Escalado", "Cerrado"]
    if new_state not in valid_states:
        return {"status": "error", "message": f"Estado debe ser uno de: {valid_states}"}

    execute(
        "UPDATE incidente SET estado = ? WHERE id_incidente = ?",
        (new_state, inc_id),
    )
    return {"status": "ok", "message": f"Incidente {inc_id} actualizado a '{new_state}'"}


def handle_get_incidents(params: dict) -> dict:
    terminal_id = params.get("terminal_id")
    bus_id = params.get("id_bus")
    estado = params.get("estado")

    sql = """
        SELECT i.*, b.patente, b.tipo_energia, c.nombre as conductor_nombre,
               t.nombre as terminal_nombre
        FROM incidente i
        JOIN bus b ON i.id_bus = b.id_bus
        JOIN terminal t ON b.id_terminal = t.id_terminal
        LEFT JOIN conductor c ON i.id_conductor = c.id_conductor
        WHERE 1=1
    """
    args = []

    if terminal_id:
        sql += " AND b.id_terminal = ?"
        args.append(terminal_id)
    if bus_id:
        sql += " AND i.id_bus = ?"
        args.append(bus_id)
    if estado:
        sql += " AND i.estado = ?"
        args.append(estado)

    sql += " ORDER BY i.fecha_hora DESC"

    incidents = query(sql, tuple(args))
    return {"status": "ok", "data": incidents, "count": len(incidents)}


def handle_get_incident_detail(params: dict) -> dict:
    inc_id = params.get("id_incidente")
    if not inc_id:
        return {"status": "error", "message": "id_incidente requerido"}

    rows = query(
        """SELECT i.*, b.patente, b.tipo_energia, c.nombre as conductor_nombre,
                  t.nombre as terminal_nombre
           FROM incidente i
           JOIN bus b ON i.id_bus = b.id_bus
           JOIN terminal t ON b.id_terminal = t.id_terminal
           LEFT JOIN conductor c ON i.id_conductor = c.id_conductor
           WHERE i.id_incidente = ?""",
        (inc_id,),
    )

    if not rows:
        return {"status": "error", "message": "Incidente no encontrado"}

    return {"status": "ok", "data": rows[0]}


def handle_get_severity_summary(params: dict) -> dict:
    terminal_id = params.get("terminal_id")

    sql_base = """
        SELECT severidad, COUNT(*) as count FROM incidente i
        JOIN bus b ON i.id_bus = b.id_bus
    """
    args = []
    if terminal_id:
        sql_base += " WHERE b.id_terminal = ?"
        args.append(terminal_id)

    sql_base += " GROUP BY severidad"

    rows = query(sql_base, tuple(args))

    summary = {r["severidad"]: r["count"] for r in rows}
    total = sum(summary.values())

    return {
        "status": "ok",
        "data": {
            "total": total,
            "critica": summary.get("Crítica", 0),
            "alta": summary.get("Alta", 0),
            "media": summary.get("Media", 0),
            "baja": summary.get("Baja", 0),
        },
    }


ACTIONS = {
    "create_incident": handle_create_incident,
    "update_incident": handle_update_incident,
    "get_incidents": handle_get_incidents,
    "get_incident_detail": handle_get_incident_detail,
    "get_severity_summary": handle_get_severity_summary,
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
