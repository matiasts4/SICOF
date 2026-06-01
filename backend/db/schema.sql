-- =============================================================================
-- SICOF — Esquema de Base de Datos
-- Compatible con SQLite (desarrollo) y PostgreSQL (producción)
-- Basado en el diccionario de datos del informe técnico
-- =============================================================================

-- ── Terminal ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terminal (
    id_terminal   INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT    NOT NULL,
    direccion     TEXT    NOT NULL,
    coordenada_lat REAL   NOT NULL,
    coordenada_lon REAL   NOT NULL,
    radio_geocerca REAL   NOT NULL DEFAULT 200.0
);

-- ── Bus ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bus (
    id_bus          INTEGER PRIMARY KEY AUTOINCREMENT,
    patente         TEXT    NOT NULL UNIQUE,
    tipo_energia    TEXT    NOT NULL CHECK (tipo_energia IN ('Diésel', 'Eléctrico')),
    modelo          TEXT,
    anio_fabricacion INTEGER,
    id_terminal     INTEGER NOT NULL,
    activo          INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (id_terminal) REFERENCES terminal(id_terminal)
);

-- ── Conductor ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conductor (
    id_conductor  INTEGER PRIMARY KEY AUTOINCREMENT,
    rut           TEXT    NOT NULL UNIQUE,
    nombre        TEXT    NOT NULL,
    licencia      TEXT    NOT NULL,
    id_terminal   INTEGER NOT NULL,
    activo        INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (id_terminal) REFERENCES terminal(id_terminal)
);

-- ── Ruta ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ruta (
    id_ruta            INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_recorrido   TEXT    NOT NULL UNIQUE,
    descripcion        TEXT,
    frecuencia_min     INTEGER NOT NULL,
    id_terminal        INTEGER NOT NULL,
    FOREIGN KEY (id_terminal) REFERENCES terminal(id_terminal)
);

-- ── Asignación ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asignacion (
    id_asignacion     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_bus            INTEGER NOT NULL,
    id_conductor      INTEGER NOT NULL,
    id_terminal       INTEGER NOT NULL,
    id_ruta           INTEGER NOT NULL,
    fecha_hora_inicio TEXT    NOT NULL,  -- ISO 8601 timestamp
    fecha_hora_fin    TEXT,              -- NULL si la asignación sigue activa
    FOREIGN KEY (id_bus)       REFERENCES bus(id_bus),
    FOREIGN KEY (id_conductor) REFERENCES conductor(id_conductor),
    FOREIGN KEY (id_terminal)  REFERENCES terminal(id_terminal),
    FOREIGN KEY (id_ruta)      REFERENCES ruta(id_ruta)
);

-- ── Incidente ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidente (
    id_incidente   INTEGER PRIMARY KEY AUTOINCREMENT,
    id_bus         INTEGER NOT NULL,
    id_conductor   INTEGER,
    tipo           TEXT    NOT NULL,
    severidad      TEXT    NOT NULL DEFAULT 'Media' CHECK (severidad IN ('Baja', 'Media', 'Alta', 'Crítica')),
    descripcion    TEXT    NOT NULL,
    coordenada_lat REAL,
    coordenada_lon REAL,
    url_evidencia  TEXT,
    estado         TEXT    NOT NULL DEFAULT 'Abierto' CHECK (estado IN ('Abierto', 'Escalado', 'Cerrado')),
    fecha_hora     TEXT    NOT NULL,  -- ISO 8601 timestamp
    FOREIGN KEY (id_bus)       REFERENCES bus(id_bus),
    FOREIGN KEY (id_conductor) REFERENCES conductor(id_conductor)
);

-- ── Usuario ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario    INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    nombre        TEXT    NOT NULL,
    rol           TEXT    NOT NULL CHECK (rol IN ('Despachador', 'Admin COF', 'Admin TI')),
    id_terminal   INTEGER,  -- NULL para Admin COF (acceso global)
    activo        INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (id_terminal) REFERENCES terminal(id_terminal)
);

-- ── Registro GPS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registro_gps (
    id_registro    INTEGER PRIMARY KEY AUTOINCREMENT,
    id_bus         INTEGER NOT NULL,
    coordenada_lat REAL    NOT NULL,
    coordenada_lon REAL    NOT NULL,
    velocidad_kmh  REAL    DEFAULT 0,
    timestamp      TEXT    NOT NULL,  -- ISO 8601 timestamp
    FOREIGN KEY (id_bus) REFERENCES bus(id_bus)
);

-- ── Estado de Carga (SoC) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estado_carga (
    id_estado     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_bus        INTEGER NOT NULL,
    nivel_carga   REAL    NOT NULL CHECK (nivel_carga >= 0 AND nivel_carga <= 100),
    autonomia_km  REAL,
    timestamp     TEXT    NOT NULL,  -- ISO 8601 timestamp
    FOREIGN KEY (id_bus) REFERENCES bus(id_bus)
);

-- ── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bus_terminal       ON bus(id_terminal);
CREATE INDEX IF NOT EXISTS idx_conductor_terminal ON conductor(id_terminal);
CREATE INDEX IF NOT EXISTS idx_asignacion_terminal ON asignacion(id_terminal);
CREATE INDEX IF NOT EXISTS idx_asignacion_bus     ON asignacion(id_bus);
CREATE INDEX IF NOT EXISTS idx_incidente_bus      ON incidente(id_bus);
CREATE INDEX IF NOT EXISTS idx_incidente_fecha    ON incidente(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_registro_gps_bus   ON registro_gps(id_bus);
CREATE INDEX IF NOT EXISTS idx_registro_gps_ts    ON registro_gps(timestamp);
CREATE INDEX IF NOT EXISTS idx_estado_carga_bus   ON estado_carga(id_bus);
CREATE INDEX IF NOT EXISTS idx_estado_carga_ts    ON estado_carga(timestamp);
CREATE INDEX IF NOT EXISTS idx_usuario_terminal   ON usuario(id_terminal);

-- ── Auditoría ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria   INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL,
    accion        TEXT    NOT NULL,
    tabla_afectada TEXT,
    registro_id    INTEGER,
    detalles      TEXT,
    fecha_hora     TEXT    NOT NULL  -- ISO 8601 timestamp
);

-- ── Parametros Globales ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parametro_global (
    clave       TEXT PRIMARY KEY,
    valor       TEXT    NOT NULL,
    tipo        TEXT    NOT NULL CHECK (tipo IN ('number', 'string', 'boolean')),
    descripcion TEXT
);

-- ── Permisos RBAC ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permiso (
    id_permiso  INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo      TEXT    NOT NULL UNIQUE,
    nombre      TEXT    NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS rol_permiso (
    rol        TEXT    NOT NULL CHECK (rol IN ('Despachador', 'Admin COF', 'Admin TI')),
    id_permiso INTEGER NOT NULL,
    PRIMARY KEY (rol, id_permiso),
    FOREIGN KEY (id_permiso) REFERENCES permiso(id_permiso)
);

-- ── Cola/Descargas de Reportes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reporte_descarga (
    id_reporte     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre         TEXT    NOT NULL,
    tipo           TEXT    NOT NULL,
    fecha_creacion TEXT    NOT NULL,  -- ISO 8601 timestamp
    url_archivo    TEXT    NOT NULL,
    creador        TEXT    NOT NULL
);

