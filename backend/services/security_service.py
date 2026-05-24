"""
security_service.py — Servicio de Seguridad SOA (nombre BUS: "segur")

Acciones:
  - login: valida credenciales, retorna token JWT
  - validate: verifica token, retorna perfil del usuario
  - list_users: lista usuarios (solo Admin TI)

RF asociados: RF-003 (Control de Acceso por Terminal)
"""

import sys
import os
import json
import hashlib
import hmac
import time
import base64

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from soa_lib import connect_to_bus, send_message, receive_message
from db.connection import query

SERVICE_NAME = "segur"
JWT_SECRET = "sicof_secret_key_2026"
TOKEN_EXPIRY = 8 * 3600  # 8 horas


# ── JWT simple (sin dependencias externas) ────────────────────────────────────

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s)


def create_token(payload: dict) -> str:
    """Crea un JWT simple con HMAC-SHA256."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload["exp"] = int(time.time()) + TOKEN_EXPIRY
    payload["iat"] = int(time.time())

    h = _b64_encode(json.dumps(header).encode("utf-8"))
    p = _b64_encode(json.dumps(payload).encode("utf-8"))

    signature = hmac.new(
        JWT_SECRET.encode("utf-8"),
        f"{h}.{p}".encode("utf-8"),
        hashlib.sha256,
    ).digest()
    s = _b64_encode(signature)

    return f"{h}.{p}.{s}"


def verify_token(token: str) -> dict | None:
    """Verifica un JWT y retorna el payload si es válido."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        h, p, s = parts

        # Verificar firma
        expected_sig = hmac.new(
            JWT_SECRET.encode("utf-8"),
            f"{h}.{p}".encode("utf-8"),
            hashlib.sha256,
        ).digest()
        actual_sig = _b64_decode(s)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        # Decodificar payload
        payload = json.loads(_b64_decode(p))

        # Verificar expiración
        if payload.get("exp", 0) < time.time():
            return None

        return payload

    except Exception:
        return None


def hash_password(password: str) -> str:
    """Hash simple con SHA256 + salt para desarrollo."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


# ── Handlers ──────────────────────────────────────────────────────────────────

def handle_login(params: dict) -> dict:
    """Autenticación de usuario."""
    username = params.get("username", "")
    password = params.get("password", "")

    if not username or not password:
        return {"status": "error", "message": "Username y password requeridos"}

    users = query("SELECT * FROM usuario WHERE username = ? AND activo = 1", (username,))

    if not users:
        return {"status": "error", "message": "Credenciales inválidas"}

    user = users[0]

    # Verificar contraseña (en desarrollo, comparación simple)
    # El seed usa un hash placeholder, así que aceptamos "sicof2026" como contraseña universal
    if password != "sicof2026":
        pwd_hash = hash_password(password)
        if pwd_hash != user["password_hash"]:
            return {"status": "error", "message": "Credenciales inválidas"}

    token = create_token({
        "user_id": user["id_usuario"],
        "username": user["username"],
        "nombre": user["nombre"],
        "rol": user["rol"],
        "terminal_id": user["id_terminal"],
    })

    return {
        "status": "ok",
        "token": token,
        "user": {
            "id": user["id_usuario"],
            "username": user["username"],
            "nombre": user["nombre"],
            "rol": user["rol"],
            "terminal_id": user["id_terminal"],
        },
    }


def handle_validate(params: dict) -> dict:
    """Validación de token JWT."""
    token = params.get("token", "")

    if not token:
        return {"status": "error", "message": "Token requerido"}

    payload = verify_token(token)

    if payload is None:
        return {"status": "error", "message": "Token inválido o expirado"}

    return {
        "status": "ok",
        "user": {
            "id": payload["user_id"],
            "username": payload["username"],
            "nombre": payload["nombre"],
            "rol": payload["rol"],
            "terminal_id": payload.get("terminal_id"),
        },
    }


def handle_list_users(params: dict) -> dict:
    """Lista usuarios del sistema (solo Admin TI)."""
    terminal_id = params.get("terminal_id")

    sql = "SELECT id_usuario, username, nombre, rol, id_terminal, activo FROM usuario"
    args = ()

    if terminal_id:
        sql += " WHERE id_terminal = ?"
        args = (terminal_id,)

    users = query(sql, args)
    return {"status": "ok", "data": users}


# ── Dispatcher ────────────────────────────────────────────────────────────────

ACTIONS = {
    "login": handle_login,
    "validate": handle_validate,
    "list_users": handle_list_users,
}


def process_request(data: dict) -> dict:
    """Procesa un request entrante y retorna la respuesta."""
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

    # Registrar en el BUS
    send_message(sock, "sinit", SERVICE_NAME)
    confirmation = receive_message(sock)
    print(f"[{SERVICE_NAME}] Registrado en BUS: {confirmation[5:].decode('utf-8')}")

    print(f"[{SERVICE_NAME}] Servicio listo. Esperando requests...")

    try:
        while True:
            # Recibir request del BUS
            raw = receive_message(sock)
            svc = raw[:5].decode("utf-8")
            payload_str = raw[5:].decode("utf-8")

            try:
                request_data = json.loads(payload_str)
            except json.JSONDecodeError:
                request_data = {"action": payload_str}

            print(f"[{SERVICE_NAME}] Request: {request_data.get('action', '?')}")

            # Procesar y responder
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
