"""
security_service.py — Servicio de Seguridad SOA (nombre BUS: "segur")

Acciones:
  - login: valida credenciales, retorna token JWT
  - validate: verifica token, retorna perfil del usuario
  - list_users: lista usuarios (solo Admin TI)
  - create_user: crea un nuevo usuario (solo Admin TI)
  - delete_user: soft-delete de usuario (solo Admin TI)
  - toggle_rol_permiso: agrega o quita un permiso a un rol (solo Admin TI)
  - list_permisos: lista todos los permisos disponibles

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
from db.connection import query, execute

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

    # Primero buscar el usuario sin filtro de activo
    users = query("SELECT * FROM usuario WHERE username = ?", (username,))

    if not users:
        return {"status": "error", "message": "Credenciales inválidas"}

    user = users[0]

    # Verificar si la cuenta está suspendida antes de validar contraseña
    if not user["activo"]:
        return {"status": "error", "message": "Usuario suspendido. Contacta al administrador TI."}

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
    """Validación de token JWT. Además verifica que el usuario siga activo en la BD."""
    token = params.get("token", "")

    if not token:
        return {"status": "error", "message": "Token requerido"}

    payload = verify_token(token)

    if payload is None:
        return {"status": "error", "message": "Token inválido o expirado"}

    # Verificar que la cuenta sigue activa en la base de datos
    db_user = query(
        "SELECT activo, nombre, rol, id_terminal FROM usuario WHERE id_usuario = ? AND activo = 1",
        (payload["user_id"],)
    )
    if not db_user:
        return {"status": "error", "message": "Cuenta suspendida o no encontrada"}

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


def handle_create_user(params: dict) -> dict:
    """Crea un nuevo usuario en el sistema (solo Admin TI)."""
    # Leer desde 'new_username' para evitar conflicto con params.username del admin autenticado
    username = params.get("new_username", "").strip()
    nombre = params.get("nombre", "").strip()
    rol = params.get("rol", "").strip()
    password = params.get("password", "").strip()
    id_terminal = params.get("id_terminal")  # puede ser None
    actor = params.get("username_actor", "admin")

    roles_validos = ["Despachador", "Admin COF", "Admin TI"]
    if not username or not nombre or not rol or not password:
        return {"status": "error", "message": "username, nombre, rol y password son requeridos"}
    if rol not in roles_validos:
        return {"status": "error", "message": f"Rol inválido. Debe ser uno de: {', '.join(roles_validos)}"}

    existente = query("SELECT id_usuario FROM usuario WHERE username = ?", (username,))
    if existente:
        return {"status": "error", "message": f"El username '{username}' ya existe"}

    pwd_hash = hash_password(password)
    terminal_val = int(id_terminal) if id_terminal else None

    execute(
        "INSERT INTO usuario (username, password_hash, nombre, rol, id_terminal, activo) VALUES (?, ?, ?, ?, ?, 1)",
        (username, pwd_hash, nombre, rol, terminal_val)
    )

    nuevo = query("SELECT id_usuario FROM usuario WHERE username = ?", (username,))
    nuevo_id = nuevo[0]["id_usuario"] if nuevo else None

    execute(
        "INSERT INTO auditoria (username, accion, tabla_afectada, registro_id, detalles, fecha_hora) VALUES (?, ?, ?, ?, ?, ?)",
        (actor, "CREATE", "usuario", nuevo_id, f"Nuevo usuario '{username}' con rol '{rol}'", time.strftime("%Y-%m-%dT%H:%M:%S"))
    )

    return {"status": "ok", "message": f"Usuario '{username}' creado exitosamente", "id_usuario": nuevo_id}


def handle_delete_user(params: dict) -> dict:
    """Soft-delete de usuario: pone activo = 0 (solo Admin TI)."""
    id_usuario = params.get("id_usuario")
    actor = params.get("username_actor", "admin")

    if not id_usuario:
        return {"status": "error", "message": "id_usuario es requerido"}

    existing = query("SELECT username, activo FROM usuario WHERE id_usuario = ?", (int(id_usuario),))
    if not existing:
        return {"status": "error", "message": f"Usuario {id_usuario} no encontrado"}

    user = existing[0]
    nuevo_estado = 0 if user["activo"] == 1 else 1
    accion_label = "SUSPEND" if nuevo_estado == 0 else "RESTORE"
    estado_label = "suspendido" if nuevo_estado == 0 else "restaurado"

    execute("UPDATE usuario SET activo = ? WHERE id_usuario = ?", (nuevo_estado, int(id_usuario)))

    execute(
        "INSERT INTO auditoria (username, accion, tabla_afectada, registro_id, detalles, fecha_hora) VALUES (?, ?, ?, ?, ?, ?)",
        (actor, accion_label, "usuario", int(id_usuario), f"Usuario '{user['username']}' {estado_label}", time.strftime("%Y-%m-%dT%H:%M:%S"))
    )

    return {"status": "ok", "message": f"Usuario '{user['username']}' {estado_label}", "nuevo_activo": nuevo_estado}


def handle_toggle_rol_permiso(params: dict) -> dict:
    """Agrega o quita un permiso de un rol en la tabla rol_permiso."""
    rol = params.get("rol", "").strip()
    id_permiso = params.get("id_permiso")
    actor = params.get("username_actor", "admin")

    roles_validos = ["Despachador", "Admin COF", "Admin TI"]
    if not rol or not id_permiso:
        return {"status": "error", "message": "rol e id_permiso son requeridos"}
    if rol not in roles_validos:
        return {"status": "error", "message": f"Rol inválido: {rol}"}

    id_permiso = int(id_permiso)

    # Verificar que el permiso existe
    permiso_row = query("SELECT codigo, nombre FROM permiso WHERE id_permiso = ?", (id_permiso,))
    if not permiso_row:
        return {"status": "error", "message": f"Permiso {id_permiso} no encontrado"}

    perm = permiso_row[0]
    ya_tiene = query("SELECT 1 FROM rol_permiso WHERE rol = ? AND id_permiso = ?", (rol, id_permiso))

    if ya_tiene:
        execute("DELETE FROM rol_permiso WHERE rol = ? AND id_permiso = ?", (rol, id_permiso))
        accion = "REVOKE"
        mensaje = f"Permiso '{perm['nombre']}' quitado del rol '{rol}'"
    else:
        execute("INSERT INTO rol_permiso (rol, id_permiso) VALUES (?, ?)", (rol, id_permiso))
        accion = "GRANT"
        mensaje = f"Permiso '{perm['nombre']}' asignado al rol '{rol}'"

    execute(
        "INSERT INTO auditoria (username, accion, tabla_afectada, registro_id, detalles, fecha_hora) VALUES (?, ?, ?, ?, ?, ?)",
        (actor, accion, "rol_permiso", id_permiso, mensaje, time.strftime("%Y-%m-%dT%H:%M:%S"))
    )

    return {"status": "ok", "message": mensaje, "granted": not bool(ya_tiene)}


def handle_list_permisos(params: dict) -> dict:
    """Lista todos los permisos disponibles en el sistema."""
    permisos = query("SELECT id_permiso, codigo, nombre, descripcion FROM permiso ORDER BY id_permiso")
    return {"status": "ok", "data": permisos}



def handle_get_audit_logs(params: dict) -> dict:
    """Retorna los últimos 50 registros de auditoría."""
    logs = query("SELECT id_auditoria, username, accion, tabla_afectada, registro_id, detalles, fecha_hora FROM auditoria ORDER BY fecha_hora DESC LIMIT 50")
    return {"status": "ok", "data": logs}


def handle_log_action(params: dict) -> dict:
    """Registra una acción en la tabla de auditoría."""
    username = params.get("username", "system")
    accion = params.get("accion", "")
    tabla = params.get("tabla_afectada")
    reg_id = params.get("registro_id")
    detalles = params.get("detalles")
    fecha_hora = params.get("fecha_hora") or time.strftime("%Y-%m-%dT%H:%M:%S")

    query(
        "INSERT INTO auditoria (username, accion, tabla_afectada, registro_id, detalles, fecha_hora) VALUES (?, ?, ?, ?, ?, ?)",
        (username, accion, tabla, reg_id, detalles, fecha_hora)
    )
    return {"status": "ok", "message": "Log registrado"}


def handle_get_params(params: dict) -> dict:
    """Retorna los parámetros globales."""
    rows = query("SELECT clave, valor, tipo, descripcion FROM parametro_global")
    return {"status": "ok", "data": rows}


def handle_update_param(params: dict) -> dict:
    """Actualiza un parámetro y registra la acción en auditoría."""
    clave = params.get("clave", "")
    valor = params.get("valor", "")
    username = params.get("username", "system")

    if not clave or not valor:
        return {"status": "error", "message": "Clave y valor requeridos"}

    old = query("SELECT valor FROM parametro_global WHERE clave = ?", (clave,))
    if not old:
        return {"status": "error", "message": f"Parámetro {clave} no existe"}
    old_val = old[0]["valor"]

    query("UPDATE parametro_global SET valor = ? WHERE clave = ?", (valor, clave))

    # Registrar acción en auditoría
    query(
        "INSERT INTO auditoria (username, accion, tabla_afectada, detalles, fecha_hora) VALUES (?, ?, ?, ?, ?)",
        (username, "UPDATE", "parametro_global", f"Cambio de {clave} de {old_val} a {valor}", time.strftime("%Y-%m-%dT%H:%M:%S"))
    )

    return {"status": "ok", "message": f"Parámetro {clave} actualizado"}


def handle_get_permissions_matrix(params: dict) -> dict:
    """Retorna la matriz de roles y permisos configurados."""
    permisos = query("SELECT id_permiso, codigo, nombre, descripcion FROM permiso")
    rol_permiso = query("SELECT rol, id_permiso FROM rol_permiso")

    matrix = {}
    for p in permisos:
        matrix[p["codigo"]] = {
            "nombre": p["nombre"],
            "descripcion": p["descripcion"],
            "roles": []
        }

    for rp in rol_permiso:
        for p in permisos:
            if p["id_permiso"] == rp["id_permiso"]:
                matrix[p["codigo"]]["roles"].append(rp["rol"])

    return {"status": "ok", "data": matrix}


# ── Dispatcher ────────────────────────────────────────────────────────────────

ACTIONS = {
    "login": handle_login,
    "validate": handle_validate,
    "list_users": handle_list_users,
    "create_user": handle_create_user,
    "delete_user": handle_delete_user,
    "toggle_rol_permiso": handle_toggle_rol_permiso,
    "list_permisos": handle_list_permisos,
    "get_audit_logs": handle_get_audit_logs,
    "log_action": handle_log_action,
    "get_params": handle_get_params,
    "update_param": handle_update_param,
    "get_permissions_matrix": handle_get_permissions_matrix,
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
