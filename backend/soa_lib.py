"""
soa_lib.py — Librería de comunicación SOA para SICOF.

Protocolo:
  [LONGITUD: 5 bytes][SERVICIO: 5 bytes][PAYLOAD: variable]

  - LONGITUD: tamaño total del bloque SERVICIO + PAYLOAD (zero-padded).
  - SERVICIO: nombre del servicio destino (exactamente 5 caracteres).
  - PAYLOAD: contenido del mensaje (string, típicamente JSON).
"""

import socket
import json


def connect_to_bus(host: str = "localhost", port: int = 5000) -> socket.socket:
    """Crea un socket TCP y lo conecta al BUS SOA."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((host, port))
    return sock


def send_message(sock: socket.socket, service_name: str, payload: str) -> None:
    """
    Empaqueta y envía un mensaje al BUS con el formato:
      [LONGITUD(5)][SERVICIO(5)][PAYLOAD]

    - service_name: exactamente 5 caracteres (se trunca/rellena si no).
    - payload: string con el contenido del mensaje.
    """
    # Asegurar que el nombre del servicio tenga exactamente 5 caracteres
    svc = service_name[:5].ljust(5)

    # El cuerpo es servicio + payload
    body = svc + payload
    body_bytes = body.encode("utf-8")

    # Longitud del cuerpo, zero-padded a 5 dígitos
    length_header = str(len(body_bytes)).zfill(5)

    # Mensaje completo: longitud + cuerpo
    message = length_header.encode("utf-8") + body_bytes
    sock.sendall(message)


def receive_message(sock: socket.socket) -> bytes:
    """
    Lee un mensaje del BUS siguiendo el protocolo:
      1. Lee 5 bytes → longitud del cuerpo.
      2. Lee exactamente esa cantidad de bytes → cuerpo completo.

    Retorna el cuerpo completo (incluye los 5 bytes del nombre de servicio).
    """
    # Leer los 5 bytes de longitud
    length_data = _recv_exact(sock, 5)
    if not length_data:
        raise ConnectionError("Conexión cerrada al leer longitud del mensaje")

    body_length = int(length_data.decode("utf-8"))

    # Leer el cuerpo completo
    body = _recv_exact(sock, body_length)
    if not body:
        raise ConnectionError("Conexión cerrada al leer cuerpo del mensaje")

    return body


def _recv_exact(sock: socket.socket, num_bytes: int) -> bytes:
    """Lee exactamente num_bytes del socket, manejando lecturas parciales."""
    data = b""
    while len(data) < num_bytes:
        chunk = sock.recv(num_bytes - len(data))
        if not chunk:
            return b""
        data += chunk
    return data


# --- Helpers de alto nivel ---

def send_json(sock: socket.socket, service_name: str, obj: dict) -> None:
    """Envía un objeto Python serializado como JSON al servicio indicado."""
    payload = json.dumps(obj, ensure_ascii=False)
    send_message(sock, service_name, payload)


def receive_json(sock: socket.socket) -> tuple[str, dict]:
    """
    Recibe un mensaje y lo parsea como JSON.
    Retorna (service_name, parsed_dict).
    """
    raw = receive_message(sock)
    service_name = raw[:5].decode("utf-8").strip()
    payload_str = raw[5:].decode("utf-8")
    try:
        data = json.loads(payload_str)
    except json.JSONDecodeError:
        data = {"raw": payload_str}
    return service_name, data


def request_service(target_service: str, action: str, params: dict = {}) -> dict:
    """
    Realiza una solicitud síncrona TCP a otro servicio a través del BUS.
    Abre una conexión temporal, envía la petición y retorna la respuesta.
    """
    import os
    host = os.environ.get("SOA_BUS_HOST", "localhost")
    port = int(os.environ.get("SOA_BUS_PORT", "5000"))

    try:
        sock = connect_to_bus(host, port)
    except Exception as e:
        return {"status": "error", "message": f"Error conectando al BUS para llamar a '{target_service}': {e}"}

    try:
        send_json(sock, target_service, {"action": action, "params": params})
        _, response = receive_json(sock)
        return response
    except Exception as e:
        return {"status": "error", "message": f"Error llamando a servicio '{target_service}': {e}"}
    finally:
        try:
            sock.close()
        except Exception:
            pass

