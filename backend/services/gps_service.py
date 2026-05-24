"""
gps_service.py — Servicio de Monitoreo GPS SOA (nombre BUS: "gpssv")

Acciones:
  - register_position: registra lat/lon/velocidad de un bus
  - get_position: última posición de un bus
  - get_fleet_positions: posiciones de todos los buses de un terminal
  - check_geofence: evalúa si un bus cruzó la geocerca del terminal

RF asociados: RF-005 (Detección de Geocerca), RF-006 (Registro Automático de Salida)
"""

import sys
import os
import json
import math

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from soa_lib import connect_to_bus, send_message, receive_message
from db.connection import query, execute

SERVICE_NAME = "gpssv"


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula distancia en metros entre dos coordenadas."""
    R = 6371000  # radio de la Tierra en metros
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def handle_register_position(params: dict) -> dict:
    required = ["id_bus", "lat", "lon", "timestamp"]
    for f in required:
        if f not in params:
            return {"status": "error", "message": f"Campo '{f}' requerido"}

    execute(
        """INSERT INTO registro_gps (id_bus, coordenada_lat, coordenada_lon, velocidad_kmh, timestamp)
           VALUES (?, ?, ?, ?, ?)""",
        (params["id_bus"], params["lat"], params["lon"], params.get("speed", 0), params["timestamp"]),
    )
    return {"status": "ok", "message": "Posición registrada"}


def handle_get_position(params: dict) -> dict:
    bus_id = params.get("id_bus")
    if not bus_id:
        return {"status": "error", "message": "id_bus requerido"}

    rows = query(
        """SELECT g.*, b.patente, b.tipo_energia
           FROM registro_gps g
           JOIN bus b ON g.id_bus = b.id_bus
           WHERE g.id_bus = ?
           ORDER BY g.timestamp DESC LIMIT 1""",
        (bus_id,),
    )
    if not rows:
        return {"status": "error", "message": "Sin datos GPS para este bus"}

    return {"status": "ok", "data": rows[0]}


def handle_get_fleet_positions(params: dict) -> dict:
    terminal_id = params.get("terminal_id")

    sql = """
        SELECT g.id_bus, g.coordenada_lat, g.coordenada_lon, g.velocidad_kmh, g.timestamp,
               b.patente, b.tipo_energia
        FROM registro_gps g
        JOIN bus b ON g.id_bus = b.id_bus
        INNER JOIN (
            SELECT id_bus, MAX(timestamp) as max_ts
            FROM registro_gps GROUP BY id_bus
        ) latest ON g.id_bus = latest.id_bus AND g.timestamp = latest.max_ts
    """
    args = ()

    if terminal_id:
        sql += " WHERE b.id_terminal = ?"
        args = (terminal_id,)

    sql += " ORDER BY b.patente"
    positions = query(sql, args)

    return {"status": "ok", "data": positions, "count": len(positions)}


def handle_check_geofence(params: dict) -> dict:
    bus_id = params.get("id_bus")
    if not bus_id:
        return {"status": "error", "message": "id_bus requerido"}

    # Obtener última posición del bus
    pos = query(
        "SELECT coordenada_lat, coordenada_lon FROM registro_gps WHERE id_bus = ? ORDER BY timestamp DESC LIMIT 1",
        (bus_id,),
    )
    if not pos:
        return {"status": "ok", "inside": None, "message": "Sin datos GPS"}

    # Obtener terminal del bus
    bus_info = query(
        """SELECT b.id_terminal, t.coordenada_lat, t.coordenada_lon, t.radio_geocerca, t.nombre
           FROM bus b JOIN terminal t ON b.id_terminal = t.id_terminal
           WHERE b.id_bus = ?""",
        (bus_id,),
    )
    if not bus_info:
        return {"status": "error", "message": "Bus no encontrado"}

    terminal = bus_info[0]
    distance = haversine(
        pos[0]["coordenada_lat"], pos[0]["coordenada_lon"],
        terminal["coordenada_lat"], terminal["coordenada_lon"],
    )

    inside = distance <= terminal["radio_geocerca"]

    return {
        "status": "ok",
        "inside": inside,
        "distance_m": round(distance, 1),
        "radio_geocerca_m": terminal["radio_geocerca"],
        "terminal": terminal["nombre"],
    }


ACTIONS = {
    "register_position": handle_register_position,
    "get_position": handle_get_position,
    "get_fleet_positions": handle_get_fleet_positions,
    "check_geofence": handle_check_geofence,
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
