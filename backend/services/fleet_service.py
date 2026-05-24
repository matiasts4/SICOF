"""
fleet_service.py — Servicio de Gestión de Flota SOA (nombre BUS: "flota")

Acciones:
  - get_buses: lista buses filtrados por terminal
  - get_bus: detalle de un bus específico
  - get_conductors: lista conductores por terminal
  - get_assignments: asignaciones activas por terminal
  - create_assignment: crea nueva asignación bus-conductor-ruta
  - get_segments: segmentos del patio (andén eléctrico, troncal, reserva)
  - get_routes: rutas asignadas a un terminal

RF asociados: RF-001 (Registro de Flota), RF-002 (Segmentación por Patio)
"""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from soa_lib import connect_to_bus, send_message, receive_message
from db.connection import query, execute

SERVICE_NAME = "flota"


# ── Handlers ──────────────────────────────────────────────────────────────────

def handle_get_buses(params: dict) -> dict:
    """Lista buses, opcionalmente filtrados por terminal."""
    terminal_id = params.get("terminal_id")

    if terminal_id:
        buses = query(
            """SELECT b.*, t.nombre as terminal_nombre
               FROM bus b
               JOIN terminal t ON b.id_terminal = t.id_terminal
               WHERE b.id_terminal = ? AND b.activo = 1
               ORDER BY b.patente""",
            (terminal_id,),
        )
    else:
        buses = query(
            """SELECT b.*, t.nombre as terminal_nombre
               FROM bus b
               JOIN terminal t ON b.id_terminal = t.id_terminal
               WHERE b.activo = 1
               ORDER BY t.nombre, b.patente""",
        )

    return {"status": "ok", "data": buses, "count": len(buses)}


def handle_get_bus(params: dict) -> dict:
    """Detalle de un bus específico."""
    bus_id = params.get("bus_id")
    if not bus_id:
        return {"status": "error", "message": "bus_id requerido"}

    buses = query(
        """SELECT b.*, t.nombre as terminal_nombre
           FROM bus b
           JOIN terminal t ON b.id_terminal = t.id_terminal
           WHERE b.id_bus = ?""",
        (bus_id,),
    )

    if not buses:
        return {"status": "error", "message": "Bus no encontrado"}

    # Obtener último estado de carga si es eléctrico
    bus = buses[0]
    if bus["tipo_energia"] == "Eléctrico":
        soc = query(
            """SELECT nivel_carga, autonomia_km, timestamp
               FROM estado_carga
               WHERE id_bus = ?
               ORDER BY timestamp DESC LIMIT 1""",
            (bus_id,),
        )
        bus["soc"] = soc[0] if soc else None

    return {"status": "ok", "data": bus}


def handle_get_conductors(params: dict) -> dict:
    """Lista conductores por terminal."""
    terminal_id = params.get("terminal_id")

    if terminal_id:
        conductors = query(
            """SELECT c.*, t.nombre as terminal_nombre
               FROM conductor c
               JOIN terminal t ON c.id_terminal = t.id_terminal
               WHERE c.id_terminal = ? AND c.activo = 1
               ORDER BY c.nombre""",
            (terminal_id,),
        )
    else:
        conductors = query(
            """SELECT c.*, t.nombre as terminal_nombre
               FROM conductor c
               JOIN terminal t ON c.id_terminal = t.id_terminal
               WHERE c.activo = 1
               ORDER BY t.nombre, c.nombre""",
        )

    return {"status": "ok", "data": conductors, "count": len(conductors)}


def handle_get_assignments(params: dict) -> dict:
    """Asignaciones activas (sin fecha_hora_fin) por terminal."""
    terminal_id = params.get("terminal_id")

    sql = """
        SELECT a.*, b.patente, b.tipo_energia, c.nombre as conductor_nombre,
               r.codigo_recorrido, t.nombre as terminal_nombre
        FROM asignacion a
        JOIN bus b ON a.id_bus = b.id_bus
        JOIN conductor c ON a.id_conductor = c.id_conductor
        JOIN ruta r ON a.id_ruta = r.id_ruta
        JOIN terminal t ON a.id_terminal = t.id_terminal
        WHERE a.fecha_hora_fin IS NULL
    """
    args = ()

    if terminal_id:
        sql += " AND a.id_terminal = ?"
        args = (terminal_id,)

    sql += " ORDER BY a.fecha_hora_inicio"

    assignments = query(sql, args)
    return {"status": "ok", "data": assignments, "count": len(assignments)}


def handle_create_assignment(params: dict) -> dict:
    """Crea una nueva asignación bus-conductor-ruta."""
    required = ["id_bus", "id_conductor", "id_terminal", "id_ruta", "fecha_hora_inicio"]
    for field in required:
        if field not in params:
            return {"status": "error", "message": f"Campo '{field}' requerido"}

    new_id = execute(
        """INSERT INTO asignacion (id_bus, id_conductor, id_terminal, id_ruta, fecha_hora_inicio)
           VALUES (?, ?, ?, ?, ?)""",
        (
            params["id_bus"],
            params["id_conductor"],
            params["id_terminal"],
            params["id_ruta"],
            params["fecha_hora_inicio"],
        ),
    )

    return {"status": "ok", "id_asignacion": new_id, "message": "Asignación creada"}


def handle_get_segments(params: dict) -> dict:
    """Segmentos del patio: agrupa buses por tipo de energía y estado."""
    terminal_id = params.get("terminal_id")
    if not terminal_id:
        return {"status": "error", "message": "terminal_id requerido"}

    # Buses eléctricos
    electric = query(
        "SELECT COUNT(*) as count FROM bus WHERE id_terminal = ? AND tipo_energia = 'Eléctrico' AND activo = 1",
        (terminal_id,),
    )
    # Buses diésel
    diesel = query(
        "SELECT COUNT(*) as count FROM bus WHERE id_terminal = ? AND tipo_energia = 'Diésel' AND activo = 1",
        (terminal_id,),
    )
    # Conductores disponibles
    drivers = query(
        "SELECT COUNT(*) as count FROM conductor WHERE id_terminal = ? AND activo = 1",
        (terminal_id,),
    )
    # Buses asignados (con asignación activa)
    assigned = query(
        "SELECT COUNT(*) as count FROM asignacion WHERE id_terminal = ? AND fecha_hora_fin IS NULL",
        (terminal_id,),
    )

    total_buses = electric[0]["count"] + diesel[0]["count"]
    assigned_count = assigned[0]["count"]
    reserve = total_buses - assigned_count

    segments = [
        {
            "name": "Andén eléctrico",
            "buses": electric[0]["count"],
            "drivers": min(drivers[0]["count"], electric[0]["count"]),
            "status": "Operativo" if electric[0]["count"] > 0 else "Sin unidades",
            "tone": "green",
        },
        {
            "name": "Andén troncal",
            "buses": diesel[0]["count"],
            "drivers": max(0, drivers[0]["count"] - electric[0]["count"]),
            "status": "Operativo" if diesel[0]["count"] > 0 else "Sin unidades",
            "tone": "blue",
        },
        {
            "name": "Reserva táctica",
            "buses": max(0, reserve),
            "drivers": max(0, drivers[0]["count"] - assigned_count),
            "status": "Cobertura" if reserve > 0 else "Sin reserva",
            "tone": "orange" if reserve <= 2 else "blue",
        },
    ]

    return {"status": "ok", "data": segments}


def handle_get_routes(params: dict) -> dict:
    """Rutas asignadas a un terminal."""
    terminal_id = params.get("terminal_id")

    if terminal_id:
        routes = query(
            "SELECT * FROM ruta WHERE id_terminal = ? ORDER BY codigo_recorrido",
            (terminal_id,),
        )
    else:
        routes = query("SELECT * FROM ruta ORDER BY codigo_recorrido")

    return {"status": "ok", "data": routes, "count": len(routes)}


def handle_get_terminals(params: dict) -> dict:
    """Lista todos los terminales."""
    terminals = query("SELECT * FROM terminal ORDER BY nombre")
    return {"status": "ok", "data": terminals, "count": len(terminals)}


# ── Dispatcher ────────────────────────────────────────────────────────────────

ACTIONS = {
    "get_buses": handle_get_buses,
    "get_bus": handle_get_bus,
    "get_conductors": handle_get_conductors,
    "get_assignments": handle_get_assignments,
    "create_assignment": handle_create_assignment,
    "get_segments": handle_get_segments,
    "get_routes": handle_get_routes,
    "get_terminals": handle_get_terminals,
}


def process_request(data: dict) -> dict:
    action = data.get("action", "")
    params = data.get("params", {})

    handler = ACTIONS.get(action)
    if handler is None:
        return {"status": "error", "message": f"Acción '{action}' no reconocida"}

    try:
        return handler(params)
    except Exception as e:
        return {"status": "error", "message": f"Error interno: {str(e)}"}


# ── Main loop ─────────────────────────────────────────────────────────────────

def main() -> None:
    host = os.environ.get("SOA_BUS_HOST", "localhost")
    port = int(os.environ.get("SOA_BUS_PORT", "5000"))

    print(f"[{SERVICE_NAME}] Conectando al BUS en {host}:{port}...")
    sock = connect_to_bus(host, port)

    send_message(sock, "sinit", SERVICE_NAME)
    confirmation = receive_message(sock)
    print(f"[{SERVICE_NAME}] Registrado: {confirmation[5:].decode('utf-8')}")
    print(f"[{SERVICE_NAME}] Servicio listo. Esperando requests...")

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
            response_str = json.dumps(response, ensure_ascii=False)
            send_message(sock, SERVICE_NAME, response_str)

    except KeyboardInterrupt:
        print(f"\n[{SERVICE_NAME}] Apagando...")
    except Exception as e:
        print(f"[{SERVICE_NAME}] Error: {e}")
    finally:
        sock.close()


if __name__ == "__main__":
    main()
