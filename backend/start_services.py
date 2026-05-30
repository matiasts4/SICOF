"""
start_services.py — Script de arranque para SICOF SOA.

Levanta el BUS y todos los servicios como subprocesos.
Uso: python backend/start_services.py
"""

import subprocess
import sys
import os
import time
import signal

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON = sys.executable

# Orden importa: primero el BUS, luego los servicios
COMPONENTS = [
    ("BUS",        os.path.join(BACKEND_DIR, "soa_bus.py")),
    ("segur",      os.path.join(BACKEND_DIR, "services", "security_service.py")),
    ("flota",      os.path.join(BACKEND_DIR, "services", "fleet_service.py")),
    ("gpssv",      os.path.join(BACKEND_DIR, "services", "gps_service.py")),
    ("carga",      os.path.join(BACKEND_DIR, "services", "soc_service.py")),
    ("frecu",      os.path.join(BACKEND_DIR, "services", "frequency_service.py")),
    ("incid",      os.path.join(BACKEND_DIR, "services", "incident_service.py")),
    ("repor",      os.path.join(BACKEND_DIR, "services", "report_service.py")),
]

processes: list[tuple[str, subprocess.Popen]] = []


def start_all() -> None:
    """Levanta todos los componentes."""
    print("=" * 60)
    print("  SICOF · Arranque de Servicios SOA")
    print("=" * 60)

    # Inicializar DB si no existe
    db_path = os.path.join(BACKEND_DIR, "db", "sicof.db")
    if not os.path.exists(db_path):
        print("\n[INIT] Inicializando base de datos...")
        subprocess.run([PYTHON, os.path.join(BACKEND_DIR, "db", "connection.py")], check=True)

    for name, script in COMPONENTS:
        print(f"\n[START] Levantando {name}...")
        proc = subprocess.Popen(
            [PYTHON, script],
            stdout=sys.stdout,
            stderr=sys.stderr,
            cwd=BACKEND_DIR,
        )
        processes.append((name, proc))

        # Dar tiempo al BUS para que esté listo antes de los servicios
        if name == "BUS":
            time.sleep(1.0)
        else:
            time.sleep(0.3)

    print("\n" + "=" * 60)
    print(f"  {len(processes)} componentes activos")
    print("  Presione Ctrl+C para detener todo")
    print("=" * 60 + "\n")


def stop_all() -> None:
    """Detiene todos los procesos."""
    print("\n[STOP] Deteniendo servicios...")
    for name, proc in reversed(processes):
        try:
            proc.terminate()
            proc.wait(timeout=3)
            print(f"  ✓ {name} detenido")
        except subprocess.TimeoutExpired:
            proc.kill()
            print(f"  ✗ {name} forzado")
        except Exception as e:
            print(f"  ✗ {name} error: {e}")


def main() -> None:
    try:
        start_all()
        # Esperar a que algún proceso termine (o Ctrl+C)
        while True:
            for name, proc in processes:
                if proc.poll() is not None:
                    print(f"\n[WARN] {name} terminó inesperadamente (code={proc.returncode})")
            time.sleep(2)
    except KeyboardInterrupt:
        pass
    finally:
        stop_all()
        print("[DONE] Todos los servicios detenidos.")


if __name__ == "__main__":
    main()
