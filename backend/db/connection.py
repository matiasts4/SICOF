"""
connection.py — Helper de conexión a base de datos para SICOF.

Soporta PostgreSQL/TimescaleDB si el driver está disponible y se solicita,
con fallback transparente a SQLite para desarrollo local ágil y sin dependencias.
"""

import os
import sqlite3

# Intentar cargar driver PostgreSQL de manera opcional
HAS_POSTGRES = False
try:
    import psycopg2
    import psycopg2.extras
    HAS_POSTGRES = True
except ImportError:
    pass

# Habilitar Postgres solo si está disponible y la variable de entorno está activa
USE_POSTGRES = HAS_POSTGRES and os.environ.get("SICOF_USE_POSTGRES") == "true"

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "sicof.db")
SCHEMA_PATH = os.path.join(DB_DIR, "schema.sql")
SEED_PATH = os.path.join(DB_DIR, "seed.sql")


def get_sqlite_connection() -> sqlite3.Connection:
    """Obtiene una conexión a la base de datos SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def get_postgres_connection():
    """Obtiene una conexión a la base de datos PostgreSQL."""
    if not HAS_POSTGRES:
        raise ImportError("psycopg2 no está instalado en este entorno.")
    
    host = os.environ.get("POSTGRES_HOST", "localhost")
    port = os.environ.get("POSTGRES_PORT", "5432")
    db = os.environ.get("POSTGRES_DB", "sicof")
    user = os.environ.get("POSTGRES_USER", "postgres")
    password = os.environ.get("POSTGRES_PASSWORD", "postgres")
    
    return psycopg2.connect(
        host=host,
        port=port,
        database=db,
        user=user,
        password=password
    )


def init_db(force: bool = False) -> None:
    """
    Inicializa la base de datos: crea tablas y carga datos iniciales.
    Soporta tanto SQLite como PostgreSQL según la configuración.
    """
    if USE_POSTGRES:
        print("[DB] Inicializando base de datos PostgreSQL...")
        conn = get_postgres_connection()
        cursor = conn.cursor()
        
        # Ejecutar schema
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            cursor.execute(f.read())
        print("[DB] Schema aplicado en PostgreSQL")

        # Ejecutar seed
        with open(SEED_PATH, "r", encoding="utf-8") as f:
            cursor.execute(f.read())
        print("[DB] Datos iniciales cargados en PostgreSQL")
        
        conn.commit()
        conn.close()
        print("[DB] Base de datos PostgreSQL lista.")
    else:
        # Lógica original para SQLite
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


def query(sql: str, params: tuple = ()) -> list[dict]:
    """Ejecuta un SELECT y retorna lista de diccionarios."""
    if USE_POSTGRES:
        conn = get_postgres_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Adaptar placeholder de SQLite (?) a Postgres (%s)
        cursor.execute(sql.replace("?", "%s"), params)
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
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
        # Adaptar placeholder
        postgres_sql = sql.replace("?", "%s")
        
        # En PostgreSQL, sqlite3's lastrowid no existe nativamente, 
        # pero podemos intentar capturarlo o simularlo si es un INSERT con RETURNING.
        # Para mantener compatibilidad simple:
        cursor.execute(postgres_sql, params)
        
        # Si es un INSERT, intentar conseguir el ID insertado
        last_id = 0
        if sql.strip().upper().startswith("INSERT"):
            try:
                # Opcional: si la tabla tiene ID autoincremental
                cursor.execute("SELECT LASTVAL()")
                last_id = cursor.fetchone()[0]
            except Exception:
                pass
                
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

