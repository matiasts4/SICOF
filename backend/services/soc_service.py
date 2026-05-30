"""
soc_service.py — Servicio de Estado de Carga SOA (nombre BUS: "carga")

Acciones:
  - register_charge: registra nivel SoC de un bus eléctrico
  - get_charge: SoC actual de un bus
  - get_alerts: buses con carga bajo umbral por terminal
  - get_charger_status: estado de bahías de carga
  - get_terminal_summary: resumen energético de un terminal

RF asociados: RF-004 (Monitoreo de Carga SoC)
"""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from soa_lib import connect_to_bus, send_message, receive_message
from db.connection import query, execute

SERVICE_NAME = "carga"

# Umbrales de SoC
SOC_CRITICAL = 30.0   # % crítico
SOC_WARNING = 50.0    # % advertencia


def handle_register_charge(params: dict) -> dict:
    required = ["id_bus", "nivel_carga", "timestamp"]
    for f in required:
        if f not in params:
            return {"status": "error", "message": f"Campo '{f}' requerido"}

    execute(
        "INSERT INTO estado_carga (id_bus, nivel_carga, autonomia_km, timestamp) VALUES (?, ?, ?, ?)",
        (params["id_bus"], params["nivel_carga"], params.get("autonomia_km"), params["timestamp"]),
    )
    return {"status": "ok", "message": "Carga registrada"}


def handle_get_charge(params: dict) -> dict:
    bus_id = params.get("id_bus")
    if not bus_id:
        return {"status": "error", "message": "id_bus requerido"}

    rows = query(
        """SELECT ec.*, b.patente
           FROM estado_carga ec
           JOIN bus b ON ec.id_bus = b.id_bus
           WHERE ec.id_bus = ? ORDER BY ec.timestamp DESC LIMIT 1""",
        (bus_id,),
    )
    if not rows:
        return {"status": "error", "message": "Sin datos de carga"}

    row = rows[0]
    level = row["nivel_carga"]
    row["status_label"] = (
        "Crítico" if level < SOC_CRITICAL else
        "Advertencia" if level < SOC_WARNING else
        "Suficiente"
    )
    row["tone"] = (
        "red" if level < SOC_CRITICAL else
        "orange" if level < SOC_WARNING else
        "green"
    )

    return {"status": "ok", "data": row}


def handle_get_alerts(params: dict) -> dict:
    terminal_id = params.get("terminal_id")
    if not terminal_id:
        return {"status": "error", "message": "terminal_id requerido"}

    # Último SoC de cada bus eléctrico del terminal
    rows = query(
        """SELECT ec.id_bus, ec.nivel_carga, ec.autonomia_km, ec.timestamp, b.patente
           FROM estado_carga ec
           JOIN bus b ON ec.id_bus = b.id_bus
           INNER JOIN (
               SELECT id_bus, MAX(timestamp) as max_ts
               FROM estado_carga GROUP BY id_bus
           ) latest ON ec.id_bus = latest.id_bus AND ec.timestamp = latest.max_ts
           WHERE b.id_terminal = ? AND b.tipo_energia = 'Eléctrico' AND ec.nivel_carga < ?
           ORDER BY ec.nivel_carga ASC""",
        (terminal_id, SOC_WARNING),
    )

    alerts = []
    for row in rows:
        level = row["nivel_carga"]
        alerts.append({
            **row,
            "severity": "Crítico" if level < SOC_CRITICAL else "Advertencia",
            "tone": "red" if level < SOC_CRITICAL else "orange",
        })

    return {"status": "ok", "data": alerts, "count": len(alerts)}


def handle_get_charger_status(params: dict) -> dict:
    """Estado simulado de bahías de carga (basado en datos de SoC)."""
    terminal_id = params.get("terminal_id")
    if not terminal_id:
        return {"status": "error", "message": "terminal_id requerido"}

    # Buses eléctricos con su SoC más reciente
    rows = query(
        """SELECT ec.id_bus, ec.nivel_carga, ec.autonomia_km, b.patente
           FROM estado_carga ec
           JOIN bus b ON ec.id_bus = b.id_bus
           INNER JOIN (
               SELECT id_bus, MAX(timestamp) as max_ts
               FROM estado_carga GROUP BY id_bus
           ) latest ON ec.id_bus = latest.id_bus AND ec.timestamp = latest.max_ts
           WHERE b.id_terminal = ? AND b.tipo_energia = 'Eléctrico'
           ORDER BY ec.nivel_carga ASC""",
        (terminal_id,),
    )

    chargers = []
    for i, row in enumerate(rows):
        level = row["nivel_carga"]
        chargers.append({
            "bay": f"Cargador {i + 1}",
            "bus": row["patente"],
            "soc": f"{level}%",
            "status": "Crítico" if level < SOC_CRITICAL else "Cargando" if level < 80 else "Listo",
            "tone": "red" if level < SOC_CRITICAL else "orange" if level < SOC_WARNING else "green",
        })

    return {"status": "ok", "data": chargers}


def handle_get_terminal_summary(params: dict) -> dict:
    terminal_id = params.get("terminal_id")
    if not terminal_id:
        return {"status": "error", "message": "terminal_id requerido"}

    total = query(
        "SELECT COUNT(*) as count FROM bus WHERE id_terminal = ? AND tipo_energia = 'Eléctrico' AND activo = 1",
        (terminal_id,),
    )[0]["count"]

    alerts_count = query(
        """SELECT COUNT(*) as count FROM estado_carga ec
           JOIN bus b ON ec.id_bus = b.id_bus
           INNER JOIN (SELECT id_bus, MAX(timestamp) as max_ts FROM estado_carga GROUP BY id_bus)
               latest ON ec.id_bus = latest.id_bus AND ec.timestamp = latest.max_ts
           WHERE b.id_terminal = ? AND b.tipo_energia = 'Eléctrico' AND ec.nivel_carga < ?""",
        (terminal_id, SOC_WARNING),
    )[0]["count"]

    critical_count = query(
        """SELECT COUNT(*) as count FROM estado_carga ec
           JOIN bus b ON ec.id_bus = b.id_bus
           INNER JOIN (SELECT id_bus, MAX(timestamp) as max_ts FROM estado_carga GROUP BY id_bus)
               latest ON ec.id_bus = latest.id_bus AND ec.timestamp = latest.max_ts
           WHERE b.id_terminal = ? AND b.tipo_energia = 'Eléctrico' AND ec.nivel_carga < ?""",
        (terminal_id, SOC_CRITICAL),
    )[0]["count"]

    return {
        "status": "ok",
        "data": {
            "total_electric": total,
            "alerts": alerts_count,
            "critical": critical_count,
            "healthy": total - alerts_count,
        },
    }


ACTIONS = {
    "register_charge": handle_register_charge,
    "get_charge": handle_get_charge,
    "get_alerts": handle_get_alerts,
    "get_charger_status": handle_get_charger_status,
    "get_terminal_summary": handle_get_terminal_summary,
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
