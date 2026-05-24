"""
frequency_service.py — Servicio de Control de Frecuencia SOA (nombre BUS: "frecu")

Acciones:
  - get_intervals: intervalos actuales por ruta
  - get_alerts: brechas críticas por terminal
  - get_corridor_status: estado de corredores

RF asociados: RF-007 (Tablero de Intervalos), RF-008 (Alertas de Frecuencia)
"""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from soa_lib import connect_to_bus, send_message, receive_message
from db.connection import query

SERVICE_NAME = "frecu"


def handle_get_intervals(params: dict) -> dict:
    """Calcula intervalos entre buses por ruta basado en datos GPS."""
    terminal_id = params.get("terminal_id")
    route_id = params.get("route_id")

    # Obtener rutas relevantes
    sql = "SELECT * FROM ruta"
    args = ()
    if terminal_id:
        sql += " WHERE id_terminal = ?"
        args = (terminal_id,)
    elif route_id:
        sql += " WHERE id_ruta = ?"
        args = (route_id,)

    routes = query(sql, args)

    intervals = []
    for route in routes:
        # Contar buses activamente asignados a esta ruta
        assigned = query(
            "SELECT COUNT(*) as count FROM asignacion WHERE id_ruta = ? AND fecha_hora_fin IS NULL",
            (route["id_ruta"],),
        )[0]["count"]

        target = route["frecuencia_min"]
        # Simular intervalo actual basado en cantidad de buses
        if assigned > 0:
            actual_gap = round(target * (1 + (0.3 if assigned < 3 else -0.1)), 1)
        else:
            actual_gap = target * 2

        deviation = round(actual_gap - target, 1)
        severity = (
            "Crítico" if deviation > target * 0.5 else
            "Advertencia" if deviation > 0 else
            "Normal"
        )
        tone = "red" if severity == "Crítico" else "orange" if severity == "Advertencia" else "green"

        intervals.append({
            "route": route["codigo_recorrido"],
            "route_id": route["id_ruta"],
            "target_min": target,
            "actual_min": actual_gap,
            "deviation": deviation,
            "buses_assigned": assigned,
            "severity": severity,
            "tone": tone,
        })

    return {"status": "ok", "data": intervals, "count": len(intervals)}


def handle_get_alerts(params: dict) -> dict:
    """Retorna solo las brechas que superan el umbral de advertencia."""
    result = handle_get_intervals(params)
    if result["status"] != "ok":
        return result

    alerts = [i for i in result["data"] if i["severity"] != "Normal"]
    return {"status": "ok", "data": alerts, "count": len(alerts)}


def handle_get_corridor_status(params: dict) -> dict:
    """Estado agregado por corredor (US4 / US6)."""
    # US6: rutas 4xx (troncales)
    us6_routes = query("SELECT * FROM ruta WHERE codigo_recorrido LIKE '4%'")
    # US4: rutas B/C (alimentadores)
    us4_routes = query("SELECT * FROM ruta WHERE codigo_recorrido LIKE 'B%' OR codigo_recorrido LIKE 'C%'")

    def corridor_summary(routes, name):
        total_deviation = 0
        critical = 0
        for r in routes:
            assigned = query(
                "SELECT COUNT(*) as count FROM asignacion WHERE id_ruta = ? AND fecha_hora_fin IS NULL",
                (r["id_ruta"],),
            )[0]["count"]
            target = r["frecuencia_min"]
            actual = target * (1 + (0.3 if assigned < 3 else -0.1)) if assigned > 0 else target * 2
            dev = actual - target
            total_deviation += dev
            if dev > target * 0.5:
                critical += 1

        avg_dev = round(total_deviation / max(len(routes), 1), 1)
        return {
            "corridor": name,
            "routes_count": len(routes),
            "avg_deviation_min": avg_dev,
            "critical_routes": critical,
            "tone": "red" if critical > 0 else "orange" if avg_dev > 0 else "green",
            "status": "Presión alta" if critical > 0 else "Monitoreado" if avg_dev > 0 else "Estable",
        }

    corridors = [
        corridor_summary(us6_routes, "US6 Troncal"),
        corridor_summary(us4_routes, "US4 Alimentador"),
    ]

    return {"status": "ok", "data": corridors}


ACTIONS = {
    "get_intervals": handle_get_intervals,
    "get_alerts": handle_get_alerts,
    "get_corridor_status": handle_get_corridor_status,
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
