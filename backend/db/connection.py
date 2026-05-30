"""
connection.py — Helper de conexión a base de datos para SICOF.

Usa SQLite para desarrollo local (sin necesidad de instalar PostgreSQL).
La estructura de tablas es compatible con PostgreSQL para producción.
"""

import sqlite3
import os

# Ruta de la base de datos SQLite
DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "sicof.db")
SCHEMA_PATH = os.path.join(DB_DIR, "schema.sql")
SEED_PATH = os.path.join(DB_DIR, "seed.sql")


def get_connection() -> sqlite3.Connection:
    """Obtiene una conexión a la base de datos SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Permite acceso por nombre de columna
    conn.execute("PRAGMA foreign_keys = ON")  # Activar FKs en SQLite
    return conn


def init_db(force: bool = False) -> None:
    """
    Inicializa la base de datos: crea tablas y carga datos iniciales.

    Args:
        force: Si True, elimina la DB existente y la recrea desde cero.
    """
    if force and os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"[DB] Base de datos eliminada: {DB_PATH}")

    already_exists = os.path.exists(DB_PATH)

    conn = get_connection()
    cursor = conn.cursor()

    # Ejecutar schema
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        cursor.executescript(f.read())
    print("[DB] Schema aplicado correctamente")

    # Cargar seed solo si la DB es nueva
    if not already_exists or force:
        with open(SEED_PATH, "r", encoding="utf-8") as f:
            cursor.executescript(f.read())
        print("[DB] Datos iniciales cargados")
    else:
        print("[DB] Base de datos existente, seed omitido")

    conn.commit()
    conn.close()
    print(f"[DB] Base de datos lista en: {DB_PATH}")


def query(sql: str, params: tuple = ()) -> list[dict]:
    """Ejecuta un SELECT y retorna lista de diccionarios."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    result = [dict(row) for row in rows]
    conn.close()
    return result


def execute(sql: str, params: tuple = ()) -> int:
    """Ejecuta un INSERT/UPDATE/DELETE y retorna el lastrowid."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(sql, params)
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return last_id


def execute_many(sql: str, params_list: list[tuple]) -> None:
    """Ejecuta un comando SQL múltiples veces con distintos parámetros."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.executemany(sql, params_list)
    conn.commit()
    conn.close()


# ── Inicializar al importar si no existe ──
if not os.path.exists(DB_PATH):
    init_db()


if __name__ == "__main__":
    import sys
    force = "--force" in sys.argv
    init_db(force=force)

    # Verificación rápida
    terminales = query("SELECT * FROM terminal")
    buses = query("SELECT * FROM bus")
    conductores = query("SELECT * FROM conductor")
    rutas = query("SELECT * FROM ruta")
    usuarios = query("SELECT * FROM usuario")

    print(f"\n[DB] Verificación:")
    print(f"  Terminales:  {len(terminales)}")
    print(f"  Buses:       {len(buses)}")
    print(f"  Conductores: {len(conductores)}")
    print(f"  Rutas:       {len(rutas)}")
    print(f"  Usuarios:    {len(usuarios)}")
