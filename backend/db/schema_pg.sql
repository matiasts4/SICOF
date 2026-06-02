-- =============================================================================
-- SICOF — Esquema de Base de Datos (PostgreSQL + TimescaleDB)
-- Compatible con TimescaleDB para series temporales de alta frecuencia.
-- Las tablas `registro_gps` y `estado_carga` se convierten en hypertables.
-- =============================================================================

-- Habilitar la extensión TimescaleDB (requiere superuser, preinstalada en la imagen oficial)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ── Terminal ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terminal (
    id_terminal    SERIAL           PRIMARY KEY,
    nombre         TEXT             NOT NULL UNIQUE,
    direccion      TEXT             NOT NULL,
    coordenada_lat DOUBLE PRECISION NOT NULL,
    coordenada_lon DOUBLE PRECISION NOT NULL,
    radio_geocerca DOUBLE PRECISION NOT NULL DEFAULT 200.0
);

-- ── Bus ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bus (
    id_bus           SERIAL   PRIMARY KEY,
    patente          TEXT     NOT NULL UNIQUE,
    tipo_energia     TEXT     NOT NULL CHECK (tipo_energia IN ('Diésel', 'Eléctrico')),
    modelo           TEXT,
    anio_fabricacion INTEGER,
    id_terminal      INTEGER  NOT NULL,
    -- SMALLINT mantiene compatibilidad con `WHERE activo = 1` de los servicios
    activo           SMALLINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_terminal) REFERENCES terminal(id_terminal)
);

-- ── Conductor ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conductor (
    id_conductor  SERIAL   PRIMARY KEY,
    rut           TEXT     NOT NULL UNIQUE,
    nombre        TEXT     NOT NULL,
    licencia      TEXT     NOT NULL,
    id_terminal   INTEGER  NOT NULL,
    activo        SMALLINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_terminal) REFERENCES terminal(id_terminal)
);

-- ── Ruta ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ruta (
    id_ruta          SERIAL  PRIMARY KEY,
    codigo_recorrido TEXT    NOT NULL UNIQUE,
    descripcion      TEXT,
    frecuencia_min   INTEGER NOT NULL,
    id_terminal      INTEGER NOT NULL,
    FOREIGN KEY (id_terminal) REFERENCES terminal(id_terminal)
);

-- ── Asignación ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asignacion (
    id_asignacion     SERIAL      PRIMARY KEY,
    id_bus            INTEGER     NOT NULL,
    id_conductor      INTEGER     NOT NULL,
    id_terminal       INTEGER     NOT NULL,
    id_ruta           INTEGER     NOT NULL,
    fecha_hora_inicio TIMESTAMPTZ NOT NULL,
    fecha_hora_fin    TIMESTAMPTZ,          -- NULL = asignación activa
    FOREIGN KEY (id_bus)       REFERENCES bus(id_bus),
    FOREIGN KEY (id_conductor) REFERENCES conductor(id_conductor),
    FOREIGN KEY (id_terminal)  REFERENCES terminal(id_terminal),
    FOREIGN KEY (id_ruta)      REFERENCES ruta(id_ruta)
);

-- ── Incidente ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidente (
    id_incidente   SERIAL           PRIMARY KEY,
    id_bus         INTEGER          NOT NULL,
    id_conductor   INTEGER,
    tipo           TEXT             NOT NULL,
    severidad      TEXT             NOT NULL DEFAULT 'Media'
                       CHECK (severidad IN ('Baja', 'Media', 'Alta', 'Crítica')),
    descripcion    TEXT             NOT NULL,
    coordenada_lat DOUBLE PRECISION,
    coordenada_lon DOUBLE PRECISION,
    url_evidencia  TEXT,
    estado         TEXT             NOT NULL DEFAULT 'Abierto'
                       CHECK (estado IN ('Abierto', 'Escalado', 'Cerrado')),
    fecha_hora     TIMESTAMPTZ      NOT NULL,
    FOREIGN KEY (id_bus)       REFERENCES bus(id_bus),
    FOREIGN KEY (id_conductor) REFERENCES conductor(id_conductor)
);

-- ── Usuario ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario    SERIAL   PRIMARY KEY,
    username      TEXT     NOT NULL UNIQUE,
    password_hash TEXT     NOT NULL,
    nombre        TEXT     NOT NULL,
    rol           TEXT     NOT NULL CHECK (rol IN ('Despachador', 'Admin COF', 'Admin TI')),
    id_terminal   INTEGER,               -- NULL = Admin COF / Admin TI (acceso global)
    activo        SMALLINT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_terminal) REFERENCES terminal(id_terminal)
);

-- ── Registro GPS — Hypertable TimescaleDB ─────────────────────────────────────
-- NOTA: Los hypertables de TimescaleDB no pueden tener PRIMARY KEY únicamente
-- sobre una columna de identidad; se usa IDENTITY sin restricción UNIQUE para
-- conservar el campo `id_registro` que devuelve `SELECT g.*` en los servicios.
CREATE TABLE IF NOT EXISTS registro_gps (
    id_registro    BIGINT           GENERATED ALWAYS AS IDENTITY,
    id_bus         INTEGER          NOT NULL,
    coordenada_lat DOUBLE PRECISION NOT NULL,
    coordenada_lon DOUBLE PRECISION NOT NULL,
    velocidad_kmh  DOUBLE PRECISION DEFAULT 0,
    timestamp      TIMESTAMPTZ      NOT NULL,
    FOREIGN KEY (id_bus) REFERENCES bus(id_bus)
);

SELECT create_hypertable(
    'registro_gps',
    'timestamp',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists       => TRUE
);

-- ── Estado de Carga (SoC) — Hypertable TimescaleDB ───────────────────────────
CREATE TABLE IF NOT EXISTS estado_carga (
    id_estado    BIGINT           GENERATED ALWAYS AS IDENTITY,
    id_bus       INTEGER          NOT NULL,
    nivel_carga  DOUBLE PRECISION NOT NULL CHECK (nivel_carga >= 0 AND nivel_carga <= 100),
    autonomia_km DOUBLE PRECISION,
    timestamp    TIMESTAMPTZ      NOT NULL,
    FOREIGN KEY (id_bus) REFERENCES bus(id_bus)
);

SELECT create_hypertable(
    'estado_carga',
    'timestamp',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists       => TRUE
);

-- ── Auditoría ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria   SERIAL      PRIMARY KEY,
    username       TEXT        NOT NULL,
    accion         TEXT        NOT NULL,
    tabla_afectada TEXT,
    registro_id    INTEGER,
    detalles       TEXT,
    fecha_hora     TIMESTAMPTZ NOT NULL
);

-- ── Parámetros Globales ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parametro_global (
    clave       TEXT PRIMARY KEY,
    valor       TEXT NOT NULL,
    tipo        TEXT NOT NULL CHECK (tipo IN ('number', 'string', 'boolean')),
    descripcion TEXT
);

-- ── Permisos RBAC ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permiso (
    id_permiso  SERIAL PRIMARY KEY,
    codigo      TEXT   NOT NULL UNIQUE,
    nombre      TEXT   NOT NULL,
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
    id_reporte     SERIAL      PRIMARY KEY,
    nombre         TEXT        NOT NULL,
    tipo           TEXT        NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL,
    url_archivo    TEXT        NOT NULL,
    creador        TEXT        NOT NULL
);

-- ── Índices ──────────────────────────────────────────────────────────────────
-- Índices estándar
CREATE INDEX IF NOT EXISTS idx_bus_terminal        ON bus(id_terminal);
CREATE INDEX IF NOT EXISTS idx_conductor_terminal  ON conductor(id_terminal);
CREATE INDEX IF NOT EXISTS idx_asignacion_terminal ON asignacion(id_terminal);
CREATE INDEX IF NOT EXISTS idx_asignacion_bus      ON asignacion(id_bus);
CREATE INDEX IF NOT EXISTS idx_incidente_bus       ON incidente(id_bus);
CREATE INDEX IF NOT EXISTS idx_incidente_fecha     ON incidente(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_usuario_terminal    ON usuario(id_terminal);

-- Índices de series temporales (complementan los de TimescaleDB)
CREATE INDEX IF NOT EXISTS idx_registro_gps_bus ON registro_gps(id_bus, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_estado_carga_bus ON estado_carga(id_bus, timestamp DESC);
