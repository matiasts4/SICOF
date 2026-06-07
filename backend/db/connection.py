"""
connection.py — Helper de conexión a base de datos para SICOF.

Soporta PostgreSQL/TimescaleDB si el driver está disponible y la variable de
entorno SICOF_USE_POSTGRES=true está activa, con fallback transparente a SQLite
para desarrollo local ágil y sin dependencias externas.

En modo PostgreSQL se usan schema_pg.sql y seed_pg.sql (nativos para PG/TimescaleDB).
En modo SQLite se usan schema.sql y seed.sql (originales, sin cambios).
"""

import datetime
import decimal
import os
import sqlite3

# Intentar cargar driver PostgreSQL de manera opcional (psycopg3)
HAS_POSTGRES = False
try:
    import psycopg
    from psycopg.rows import dict_row as _pg_dict_row
    HAS_POSTGRES = True
except ImportError:
    pass

# Habilitar Postgres solo si está disponible y la variable de entorno está activa
USE_POSTGRES = HAS_POSTGRES and os.environ.get("SICOF_USE_POSTGRES") == "true"

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "sicof.db")

# Archivos SQLite (desarrollo local)
SCHEMA_PATH = os.path.join(DB_DIR, "schema.sql")
SEED_PATH   = os.path.join(DB_DIR, "seed.sql")

# Archivos PostgreSQL/TimescaleDB (producción)
SCHEMA_PG_PATH = os.path.join(DB_DIR, "schema_pg.sql")
SEED_PG_PATH   = os.path.join(DB_DIR, "seed_pg.sql")


def get_sqlite_connection() -> sqlite3.Connection:
    """Obtiene una conexión a la base de datos SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def get_postgres_connection():
    """Obtiene una conexión a la base de datos PostgreSQL (psycopg3)."""
    if not HAS_POSTGRES:
        raise ImportError(
            "psycopg no está instalado. Ejecuta: pip install 'psycopg[binary]>=3.1'"
        )

    host     = os.environ.get("POSTGRES_HOST",     "localhost")
    port     = os.environ.get("POSTGRES_PORT",     "5432")
    db       = os.environ.get("POSTGRES_DB",       "sicof")
    user     = os.environ.get("POSTGRES_USER",     "postgres")
    password = os.environ.get("POSTGRES_PASSWORD", "postgres")

    return psycopg.connect(
        host=host,
        port=int(port),
        dbname=db,
        user=user,
        password=password,
        connect_timeout=5,   # Falla rápido si PostgreSQL no está disponible
    )


def init_db(force: bool = False) -> None:
    """
    Inicializa la base de datos: crea tablas y carga datos iniciales.
    Soporta tanto SQLite como PostgreSQL/TimescaleDB según la configuración.

    En modo PostgreSQL:
      - El schema (DDL) se ejecuta con autocommit=True (necesario para CREATE EXTENSION,
        CREATE TABLE y create_hypertable de TimescaleDB).
      - El seed se ejecuta en una transacción con ON CONFLICT DO NOTHING, por lo que
        es completamente idempotente: re-ejecutar no duplica datos.
      - `force` recrea el schema igualmente; el seed es siempre idempotente.
    """
    if USE_POSTGRES:
        print("[DB] Inicializando base de datos PostgreSQL/TimescaleDB...")
        conn = get_postgres_connection()

        # ── DDL: usar autocommit para CREATE EXTENSION / CREATE TABLE / create_hypertable
        conn.autocommit = True
        cursor = conn.cursor()
        with open(SCHEMA_PG_PATH, "r", encoding="utf-8") as f:
            cursor.execute(f.read())
        print("[DB] Schema PostgreSQL/TimescaleDB aplicado")

        # ── Seed: solo cargar si la BD está vacía o force=True
        # Las tablas sin UNIQUE (registro_gps, asignacion, incidente, etc.)
        # se duplicarían si el seed se ejecutara en cada reinicio.
        cursor.execute("SELECT COUNT(*) FROM terminal")
        already_seeded = cursor.fetchone()[0] > 0

        if not already_seeded or force:
            conn.autocommit = False
            with open(SEED_PG_PATH, "r", encoding="utf-8") as f:
                cursor.execute(f.read())
            conn.commit()
            print("[DB] Datos iniciales cargados en PostgreSQL")
        else:
            print("[DB] Datos iniciales ya presentes, seed omitido")

        conn.close()
        print("[DB] Base de datos PostgreSQL lista.")
    else:
        # ── Lógica original para SQLite (sin cambios)
        if force and os.path.exists(DB_PATH):
            os.remove(DB_PATH)
            print(f"[DB] Base de datos SQLite eliminada: {DB_PATH}")

        already_exists = os.path.exists(DB_PATH)
        conn = get_sqlite_connection()
        cursor = conn.cursor()

        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            cursor.executescript(f.read())
        print("[DB] Schema SQLite aplicado correctamente")

        if not already_exists or force:
            with open(SEED_PATH, "r", encoding="utf-8") as f:
                cursor.executescript(f.read())
            print("[DB] Datos iniciales SQLite cargados")
        else:
            print("[DB] Base de datos SQLite existente, seed omitido")

        conn.commit()
        conn.close()
        print(f"[DB] Base de datos SQLite lista en: {DB_PATH}")


def _json_safe(row: dict) -> dict:
    """
    Convierte tipos no-JSON-serializables que devuelve psycopg2 a tipos Python básicos.
    - datetime/date/time  → string ISO 8601
    - Decimal             → float
    Esto permite que los servicios hagan json.dumps() sin necesidad de un encoder custom.
    """
    result = {}
    for k, v in row.items():
        if isinstance(v, (datetime.datetime, datetime.date, datetime.time)):
            result[k] = v.isoformat()
        elif isinstance(v, decimal.Decimal):
            result[k] = float(v)
        else:
            result[k] = v
    return result


def query(sql: str, params: tuple = ()) -> list[dict]:
    """Ejecuta un SELECT y retorna lista de diccionarios."""
    if USE_POSTGRES:
        conn = get_postgres_connection()
        # dict_row hace que cada fila sea un dict directamente
        cursor = conn.cursor(row_factory=_pg_dict_row)
        # Adaptar placeholder de SQLite (?) a Postgres (%s)
        cursor.execute(sql.replace("?", "%s"), params or None)
        rows = cursor.fetchall()
        # _json_safe convierte datetime → str para que json.dumps() no falle
        result = [_json_safe(dict(row)) for row in rows]
        conn.close()
        return result
    else:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        conn.close()
        return result


def execute(sql: str, params: tuple = ()) -> int:
    """Ejecuta un INSERT/UPDATE/DELETE y retorna el lastrowid o ID generado."""
    if USE_POSTGRES:
        conn = get_postgres_connection()
        cursor = conn.cursor()
        postgres_sql = sql.replace("?", "%s")
        cursor.execute(postgres_sql, params or None)

        # Intentar obtener el ID del último INSERT (si la tabla tiene secuencia).
        # Se usa un SAVEPOINT para que si LASTVAL() falla (tablas con PK compuesta
        # sin secuencia, como rol_permiso), la transacción principal no quede abortada.
        last_id = 0
        if sql.strip().upper().startswith("INSERT"):
            try:
                cursor.execute("SAVEPOINT _lastval_check")
                cursor.execute("SELECT LASTVAL()")
                last_id = cursor.fetchone()[0]
                cursor.execute("RELEASE SAVEPOINT _lastval_check")
            except Exception:
                # Revertir solo al savepoint, preservando el INSERT original
                cursor.execute("ROLLBACK TO SAVEPOINT _lastval_check")

        conn.commit()
        conn.close()
        return last_id
    else:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute(sql, params)
        conn.commit()
        last_id = cursor.lastrowid
        conn.close()
        return last_id


def execute_many(sql: str, params_list: list[tuple]) -> None:
    """Ejecuta un comando SQL múltiples veces con distintos parámetros."""
    if USE_POSTGRES:
        conn = get_postgres_connection()
        cursor = conn.cursor()
        cursor.executemany(sql.replace("?", "%s"), params_list)
        conn.commit()
        conn.close()
    else:
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        cursor.executemany(sql, params_list)
        conn.commit()
        conn.close()


# Inicializar SQLite local al importar si no existe base de datos
if not USE_POSTGRES and not os.path.exists(DB_PATH):
    init_db()


if __name__ == "__main__":
    import sys
    force = "--force" in sys.argv
    init_db(force=force)

    # Verificación rápida
    try:
        terminales = query("SELECT * FROM terminal")
        print(f"\n[DB] Conectado exitosamente. Terminales en DB: {len(terminales)}")
    except Exception as e:
        print(f"\n[DB] Error en verificación rápida: {e}")

