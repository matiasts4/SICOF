"""
soa_bus.py — BUS central SOA para SICOF.

Actúa como router de mensajes TCP:
  - Los SERVICIOS se conectan y se registran enviando un mensaje a "sinit".
  - Los CLIENTES se conectan y envían mensajes indicando el servicio destino.
  - El BUS enruta el mensaje al servicio registrado y devuelve la respuesta al cliente.

Protocolo: [LONGITUD(5)][SERVICIO(5)][PAYLOAD]

Uso:
  python soa_bus.py [--port 5000]
"""

import socket
import threading
import sys
import time


# ── Protocolo ──────────────────────────────────────────────────────────────────

def recv_exact(sock: socket.socket, num_bytes: int) -> bytes:
    """Lee exactamente num_bytes del socket."""
    data = b""
    while len(data) < num_bytes:
        chunk = sock.recv(num_bytes - len(data))
        if not chunk:
            return b""
        data += chunk
    return data


def read_message(sock: socket.socket) -> tuple[str, bytes] | None:
    """
    Lee un mensaje completo del socket.
    Retorna (service_name, payload_bytes) o None si la conexión se cerró.
    """
    length_data = recv_exact(sock, 5)
    if not length_data:
        return None

    body_length = int(length_data.decode("utf-8"))
    body = recv_exact(sock, body_length)
    if not body:
        return None

    service_name = body[:5].decode("utf-8")
    payload = body[5:]
    return service_name, payload


def send_raw(sock: socket.socket, service_name: str, payload: bytes) -> None:
    """Envía un mensaje con el formato del protocolo SOA."""
    svc = service_name[:5].ljust(5).encode("utf-8")
    body = svc + payload
    length_header = str(len(body)).zfill(5).encode("utf-8")
    sock.sendall(length_header + body)


# ── BUS ────────────────────────────────────────────────────────────────────────

class SoaBus:
    """Router central de mensajes SOA."""

    def __init__(self, host: str = "0.0.0.0", port: int = 5000):
        self.host = host
        self.port = port
        # Mapa: nombre_servicio -> socket del servicio registrado
        self.services: dict[str, socket.socket] = {}
        # Lock para acceso concurrente al mapa de servicios
        self.services_lock = threading.Lock()
        # Lock por servicio para serializar requests (un servicio procesa uno a la vez)
        self.service_locks: dict[str, threading.Lock] = {}
        self.server_socket: socket.socket | None = None

    def start(self) -> None:
        """Inicia el servidor TCP del BUS."""
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(50)
        print(f"[BUS] Escuchando en {self.host}:{self.port}")

        try:
            while True:
                client_sock, addr = self.server_socket.accept()
                thread = threading.Thread(
                    target=self._handle_connection,
                    args=(client_sock, addr),
                    daemon=True,
                )
                thread.start()
        except KeyboardInterrupt:
            print("\n[BUS] Apagando...")
        finally:
            self.server_socket.close()

    def _handle_connection(self, client_sock: socket.socket, addr: tuple) -> None:
        """Maneja una conexión entrante (puede ser un servicio o un cliente)."""
        try:
            result = read_message(client_sock)
            if result is None:
                client_sock.close()
                return

            service_name, payload = result

            # ── Registro de servicio ──
            if service_name.strip() == "sinit":
                self._register_service(client_sock, payload, addr)
                return

            # ── Request de un cliente ──
            self._route_request(client_sock, service_name, payload, addr)

        except Exception as e:
            print(f"[BUS] Error manejando conexión de {addr}: {e}")
            try:
                client_sock.close()
            except Exception:
                pass

    def _register_service(
        self, sock: socket.socket, payload: bytes, addr: tuple
    ) -> None:
        """Registra un servicio en el BUS."""
        svc_name = payload.decode("utf-8").strip()

        with self.services_lock:
            # Si ya había un servicio con ese nombre, cerrar el viejo
            if svc_name in self.services:
                try:
                    self.services[svc_name].close()
                except Exception:
                    pass
                print(f"[BUS] Re-registrando servicio '{svc_name}' desde {addr}")
            else:
                print(f"[BUS] Servicio '{svc_name}' registrado desde {addr}")

            self.services[svc_name] = sock
            if svc_name not in self.service_locks:
                self.service_locks[svc_name] = threading.Lock()

        # Confirmar registro al servicio
        send_raw(sock, "sinit", f"OK {svc_name}".encode("utf-8"))

    def _route_request(
        self,
        client_sock: socket.socket,
        service_name: str,
        payload: bytes,
        addr: tuple,
    ) -> None:
        """Enruta un request de cliente hacia el servicio y devuelve la respuesta."""
        svc_name = service_name.strip()

        with self.services_lock:
            svc_sock = self.services.get(svc_name)
            svc_lock = self.service_locks.get(svc_name)

        if svc_sock is None or svc_lock is None:
            # Servicio no registrado
            error_msg = f'{{"status":"error","message":"Servicio \'{svc_name}\' no registrado"}}'
            send_raw(client_sock, svc_name, error_msg.encode("utf-8"))
            client_sock.close()
            return

        # Serializar acceso al servicio (un request a la vez)
        with svc_lock:
            try:
                # Reenviar al servicio
                send_raw(svc_sock, svc_name, payload)

                # Esperar respuesta del servicio
                result = read_message(svc_sock)
                if result is None:
                    raise ConnectionError(f"Servicio '{svc_name}' cerró la conexión")

                resp_svc, resp_payload = result

                # Devolver respuesta al cliente
                send_raw(client_sock, resp_svc, resp_payload)

            except Exception as e:
                print(f"[BUS] Error en ruta hacia '{svc_name}': {e}")
                # Limpiar servicio muerto
                with self.services_lock:
                    if svc_name in self.services:
                        del self.services[svc_name]
                        print(f"[BUS] Servicio '{svc_name}' removido (desconectado)")

                error_msg = f'{{"status":"error","message":"Servicio \'{svc_name}\' no disponible"}}'
                try:
                    send_raw(client_sock, svc_name, error_msg.encode("utf-8"))
                except Exception:
                    pass

            finally:
                try:
                    client_sock.close()
                except Exception:
                    pass


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    port = 5000
    if "--port" in sys.argv:
        idx = sys.argv.index("--port")
        if idx + 1 < len(sys.argv):
            port = int(sys.argv[idx + 1])

    bus = SoaBus(port=port)
    bus.start()


if __name__ == "__main__":
    main()
