"""
start_services.py — Script de arranque para SICOF SOA.

Levanta el BUS y todos los servicios como subprocesos.
Uso: python backend/start_services.py
"""

import subprocess
import sys
import os
import time

# Forzar UTF-8 en stdout/stderr para que los caracteres Unicode (✓ ✗ …)
# se impriman correctamente en terminales Windows (que usan CP1252 por defecto).
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
PYTHON      = sys.executable

# Forzar salida sin buffer en este proceso y en todos los subprocesos Python.
# Equivale a ejecutar con `python -u` — garantiza que los prints aparezcan
# inmediatamente en la consola sin esperar que se llene el buffer.
os.environ["PYTHONUNBUFFERED"] = "1"


def _load_dotenv() -> None:
    """
    Carga variables desde el archivo .env en la raiz del proyecto.
    Implementado sin dependencias externas (no requiere python-dotenv).
    Solo carga variables que NO estén ya definidas en el entorno del proceso.
    """
    env_path = os.path.join(PROJECT_DIR, ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip()
            # No sobreescribir variables ya definidas (permite override manual)
            if key and key not in os.environ:
                os.environ[key] = value
    print("[INIT] Variables de entorno cargadas desde .env")


_load_dotenv()

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


import socket as _socket


def _kill_port(port: int) -> bool:
    """
    Intenta liberar el puerto matando cualquier proceso que lo ocupe.
    Solo aplica en Windows. En otros SO es un no-op silencioso.
    Retorna True si mató algún proceso, False si el puerto ya estaba libre.
    """
    if sys.platform != "win32":
        return False
    try:
        result = subprocess.run(
            ["netstat", "-ano"],
            capture_output=True, text=True, timeout=5
        )
        for line in result.stdout.splitlines():
            if f":{port}" in line and "LISTENING" in line:
                parts = line.split()
                pid = parts[-1]
                subprocess.run(["taskkill", "/PID", pid, "/F"],
                               capture_output=True, timeout=5)
                print(f"[INIT] Puerto {port} liberado (PID {pid})")
                return True  # Se mató un proceso, el puerto necesita tiempo para liberarse
    except Exception:
        pass
    return False  # Puerto ya estaba libre o no se pudo determinar


def _wait_for_bus(host: str = "localhost", port: int = 5000,
                  timeout: float = 10.0) -> bool:
    """
    Espera hasta que el BUS acepte conexiones TCP.
    Retorna True si el BUS está listo, False si se agotó el tiempo.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with _socket.create_connection((host, port), timeout=0.5):
                return True
        except OSError:
            time.sleep(0.2)
    return False


def _wait_port_free(host: str = "localhost", port: int = 5000,
                    timeout: float = 8.0) -> bool:
    """
    Espera hasta que el puerto quede libre (no acepte conexiones).
    Se usa tras matar el BUS viejo para garantizar que el nuevo puede bindear.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with _socket.create_connection((host, port), timeout=0.3):
                time.sleep(0.3)  # Puerto todavía ocupado
        except OSError:
            return True  # Puerto libre: conexión rechazada
    return False


def start_all() -> None:
    """Levanta todos los componentes."""
    print("=" * 60)
    print("  SICOF · Arranque de Servicios SOA")
    print("=" * 60)

    # Inicializar DB
    use_postgres = os.environ.get("SICOF_USE_POSTGRES") == "true"
    db_path = os.path.join(BACKEND_DIR, "db", "sicof.db")
    if use_postgres or not os.path.exists(db_path):
        print("\n[INIT] Inicializando base de datos...")
        try:
            subprocess.run(
                [PYTHON, os.path.join(BACKEND_DIR, "db", "connection.py")],
                check=True,
                env=os.environ,
                stderr=subprocess.PIPE,  # Suprime el traceback en consola
            )
        except subprocess.CalledProcessError as exc:
            if use_postgres:
                print("[WARN] PostgreSQL no disponible (¿Docker no está corriendo?)", flush=True)
                print("[WARN] Usando SQLite como fallback de desarrollo.", flush=True)
                os.environ["SICOF_USE_POSTGRES"] = "false"
                # Inicializar SQLite si tampoco existe la BD local
                if not os.path.exists(db_path):
                    subprocess.run(
                        [PYTHON, os.path.join(BACKEND_DIR, "db", "connection.py")],
                        check=True,
                        env=os.environ,
                    )
            else:
                # Error inesperado en modo SQLite: mostrar el detalle
                if exc.stderr:
                    sys.stderr.write(exc.stderr.decode(errors="replace"))
                raise

    # Liberar puerto del BUS si quedó ocupado de una sesión anterior
    if _kill_port(5000):
        # Esperar que el SO libere el puerto antes de arrancar el BUS nuevo
        if _wait_port_free():
            print("[INIT] Puerto 5000 libre")
        else:
            print("[WARN] Puerto 5000 puede seguir ocupado, intentando de todas formas...")

    for name, script in COMPONENTS:
        print(f"\n[START] Levantando {name}...")
        proc = subprocess.Popen(
            [PYTHON, script],
            stdout=sys.stdout,
            stderr=sys.stderr,
            cwd=BACKEND_DIR,
        )
        processes.append((name, proc))

        if name == "BUS":
            # Espera activa: confirmar que el BUS acepta conexiones TCP
            if _wait_for_bus():
                print("[INIT] BUS listo en localhost:5000")
            else:
                print("[WARN] BUS tardó demasiado en responder, continuando de todas formas...")
        else:
            time.sleep(0.3)

    print("\n" + "=" * 60, flush=True)
    print(f"  {len(processes)} componentes activos", flush=True)
    print("  Presione Ctrl+C para detener todo", flush=True)
    print("=" * 60 + "\n", flush=True)


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
        # Loop de supervisión: reinicia servicios (no el BUS) si mueren inesperadamente
        while True:
            time.sleep(2)
            for i, (name, proc) in enumerate(processes):
                if proc.poll() is not None:
                    print(f"\n[WARN] {name} terminó (code={proc.returncode}) — reiniciando...")
                    if name == "BUS":
                        # Si el BUS muere, no tiene sentido seguir
                        raise RuntimeError("BUS caído, deteniendo todo.")
                    # Reiniciar el servicio caído
                    _, script = COMPONENTS[i]
                    new_proc = subprocess.Popen(
                        [PYTHON, script],
                        stdout=sys.stdout,
                        stderr=sys.stderr,
                        cwd=BACKEND_DIR,
                    )
                    processes[i] = (name, new_proc)
                    print(f"[INFO] {name} reiniciado (PID {new_proc.pid})")
    except KeyboardInterrupt:
        pass
    except RuntimeError as e:
        print(f"\n[ERROR] {e}")
    finally:
        stop_all()
        print("[DONE] Todos los servicios detenidos.")


if __name__ == "__main__":
    main()
