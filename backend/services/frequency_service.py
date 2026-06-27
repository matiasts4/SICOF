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

from soa_lib import connect_to_bus, send_message, receive_message, request_service
from db.connection import query

SERVICE_NAME = "frecu"


def handle_get_intervals(params: dict) -> dict:
    """Calcula intervalos entre buses por ruta basado en datos GPS."""
    terminal_id = params.get("terminal_id")
    route_id = params.get("route_id")

    # Obtener rutas relevantes desde el servicio de flota
    routes_resp = request_service("flota", "get_routes", {"terminal_id": terminal_id} if terminal_id else {})
    if routes_resp.get("status") != "ok":
        return {"status": "error", "message": "Error al obtener rutas del servicio de flota"}

    routes = routes_resp.get("data", [])
    if route_id:
        routes = [r for r in routes if r["id_ruta"] == route_id]

    # Obtener todas las asignaciones activas desde el servicio de flota para contar por ruta
    assignments_resp = request_service("flota", "get_assignments", {"terminal_id": terminal_id} if terminal_id else {})
    assignments = assignments_resp.get("data", []) if assignments_resp.get("status") == "ok" else []

    intervals = []
    for route in routes:
        # Contar buses activamente asignados a esta ruta
        assigned = sum(1 for a in assignments if a.get("id_ruta") == route["id_ruta"])

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
    # Obtener todas las rutas del servicio de flota
    routes_resp = request_service("flota", "get_routes")
    if routes_resp.get("status") != "ok":
        return {"status": "error", "message": "Error al obtener rutas del servicio de flota"}
    all_routes = routes_resp.get("data", [])

    # US6: rutas 4xx (troncales)
    us6_routes = [r for r in all_routes if r["codigo_recorrido"].startswith("4")]
    # US4: rutas B/C (alimentadores)
    us4_routes = [r for r in all_routes if r["codigo_recorrido"].startswith("B") or r["codigo_recorrido"].startswith("C")]

    # Obtener asignaciones activas de flota una sola vez
    assignments_resp = request_service("flota", "get_assignments")
    all_assignments = assignments_resp.get("data", []) if assignments_resp.get("status") == "ok" else []

    def corridor_summary(routes, name):
        total_deviation = 0
        critical = 0
        for r in routes:
            assigned = sum(1 for a in all_assignments if a.get("id_ruta") == r["id_ruta"])
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
