"""
test_soa.py — Test rápido del sistema SOA de SICOF.

Prueba:
  1. Conexión al BUS
  2. Request a servicio de seguridad (login)
  3. Request a servicio de flota (get_buses)
  4. Request a servicio de incidentes (get_incidents)

Requiere que el BUS y los servicios estén corriendo (start_services.py).
"""

import sys
import os
import json
import time

# Forzar UTF-8 en stdout/stderr para que los caracteres Unicode se impriman correctamente en Windows.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from soa_lib import connect_to_bus, send_json, receive_json


def test_service(name: str, action: str, params: dict = {}) -> dict:
    """Envía un request a un servicio y muestra la respuesta."""
    print(f"\n{'─' * 50}")
    print(f"  TEST: {name} → {action}")
    print(f"{'─' * 50}")

    try:
        sock = connect_to_bus()
        send_json(sock, name, {"action": action, "params": params})
        svc, response = receive_json(sock)
        sock.close()

        status = response.get("status", "?")
        print(f"  Status: {status}")

        if status == "ok":
            data = response.get("data")
            if isinstance(data, list):
                print(f"  Registros: {len(data)}")
                if data:
                    print(f"  Primer item: {json.dumps(data[0], ensure_ascii=False, indent=2)[:200]}")
            elif isinstance(data, dict):
                print(f"  Data: {json.dumps(data, ensure_ascii=False, indent=2)[:300]}")
            else:
                # Podría ser token u otro valor
                for k, v in response.items():
                    if k != "status":
                        val_str = str(v)[:100]
                        print(f"  {k}: {val_str}")
        else:
            print(f"  Mensaje: {response.get('message', '?')}")

        print(f"  ✓ OK")
        return response

    except Exception as e:
        print(f"  ✗ ERROR: {e}")
        return {"status": "error", "message": str(e)}


def main():
    print("=" * 50)
    print("  SICOF · Test del Sistema SOA")
    print("=" * 50)

    # 1. Login
    login_result = test_service("segur", "login", {
        "username": "cpizarro",
        "password": "sicof2026",
    })

    # 2. Validar token
    if login_result.get("token"):
        test_service("segur", "validate", {
            "token": login_result["token"],
        })

    # 3. Listar buses de El Roble (terminal 1)
    test_service("flota", "get_buses", {"terminal_id": 1})

    # 4. Segmentos del patio
    test_service("flota", "get_segments", {"terminal_id": 1})

    # 5. Terminales
    test_service("flota", "get_terminals", {})

    # 6. Posiciones GPS
    test_service("gpssv", "get_fleet_positions", {"terminal_id": 1})

    # 7. Alertas de carga
    test_service("carga", "get_alerts", {"terminal_id": 1})

    # 8. Intervalos de frecuencia
    test_service("frecu", "get_intervals", {"terminal_id": 1})

    # 9. Incidentes
    test_service("incid", "get_incidents", {"terminal_id": 1})

    # 10. KPIs
    test_service("repor", "get_kpis", {})

    print(f"\n{'=' * 50}")
    print("  Tests completados")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
