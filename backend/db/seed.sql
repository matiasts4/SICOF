-- =============================================================================
-- SICOF — Datos Iniciales (Seed)
-- Coherente con la mock data del prototipo visual
-- =============================================================================

-- ── Terminales (6 patios reales de RBU Santiago) ─────────────────────────────
INSERT INTO terminal (nombre, direccion, coordenada_lat, coordenada_lon, radio_geocerca) VALUES
    ('El Roble',        'Av. El Roble 1200, Quilicura',       -33.3580, -70.7340, 250.0),
    ('Colo Colo',       'Colo Colo 980, Independencia',       -33.4110, -70.6580, 200.0),
    ('El Salto',        'El Salto 4500, Recoleta',            -33.3950, -70.6380, 220.0),
    ('Lo Echevers',     'Lo Echevers 600, Quilicura',         -33.3490, -70.7100, 230.0),
    ('José Arrieta',    'José Arrieta 8700, Peñalolén',       -33.4780, -70.5630, 200.0),
    ('María Angélica',  'María Angélica 2100, Pudahuel',      -33.4320, -70.7620, 240.0);

-- ── Buses (coherentes con el prototipo) ──────────────────────────────────────
-- Terminal 1: El Roble
INSERT INTO bus (patente, tipo_energia, modelo, anio_fabricacion, id_terminal) VALUES
    ('EB-214', 'Eléctrico', 'Yutong E12',       2023, 1),
    ('EB-301', 'Eléctrico', 'Yutong E12',       2023, 1),
    ('EB-455', 'Eléctrico', 'BYD K9',           2024, 1),
    ('EB-118', 'Eléctrico', 'Yutong E12',       2023, 1),
    ('EB-212', 'Eléctrico', 'BYD K9',           2024, 1),
    ('D-226',  'Diésel',    'Mercedes-Benz O500', 2021, 1),
    ('D-118',  'Diésel',    'Mercedes-Benz O500', 2020, 1),
    ('D-287',  'Diésel',    'Volvo B290R',       2022, 1);

-- Terminal 2: Colo Colo
INSERT INTO bus (patente, tipo_energia, modelo, anio_fabricacion, id_terminal) VALUES
    ('EB-320', 'Eléctrico', 'Yutong E12',       2023, 2),
    ('EB-411', 'Eléctrico', 'BYD K9',           2024, 2),
    ('D-145',  'Diésel',    'Mercedes-Benz O500', 2021, 2),
    ('D-189',  'Diésel',    'Volvo B290R',       2022, 2);

-- Terminal 3: El Salto
INSERT INTO bus (patente, tipo_energia, modelo, anio_fabricacion, id_terminal) VALUES
    ('EB-502', 'Eléctrico', 'BYD K9',           2024, 3),
    ('D-310',  'Diésel',    'Mercedes-Benz O500', 2021, 3),
    ('D-322',  'Diésel',    'Volvo B290R',       2022, 3);

-- Terminal 4: Lo Echevers
INSERT INTO bus (patente, tipo_energia, modelo, anio_fabricacion, id_terminal) VALUES
    ('EB-601', 'Eléctrico', 'Yutong E12',       2023, 4),
    ('D-402',  'Diésel',    'Mercedes-Benz O500', 2020, 4),
    ('D-418',  'Diésel',    'Volvo B290R',       2022, 4),
    ('D-430',  'Diésel',    'Mercedes-Benz O500', 2021, 4);

-- Terminal 5: José Arrieta
INSERT INTO bus (patente, tipo_energia, modelo, anio_fabricacion, id_terminal) VALUES
    ('EB-710', 'Eléctrico', 'BYD K9',           2024, 5),
    ('D-515',  'Diésel',    'Volvo B290R',       2022, 5),
    ('D-520',  'Diésel',    'Mercedes-Benz O500', 2021, 5);

-- Terminal 6: María Angélica
INSERT INTO bus (patente, tipo_energia, modelo, anio_fabricacion, id_terminal) VALUES
    ('EB-830', 'Eléctrico', 'Yutong E12',       2023, 6),
    ('D-620',  'Diésel',    'Mercedes-Benz O500', 2021, 6),
    ('D-635',  'Diésel',    'Volvo B290R',       2022, 6),
    ('D-640',  'Diésel',    'Mercedes-Benz O500', 2020, 6);

-- ── Conductores (coherentes con el prototipo) ────────────────────────────────
-- Terminal 1: El Roble
INSERT INTO conductor (rut, nombre, licencia, id_terminal) VALUES
    ('12.345.678-9', 'Carla Pizarro',    'A2-001', 1),
    ('13.456.789-0', 'Juan Rojas',       'A2-002', 1),
    ('14.567.890-1', 'Andrea Peña',      'A2-003', 1),
    ('15.678.901-2', 'Mauricio Lagos',   'A2-004', 1),
    ('16.789.012-3', 'Daniel Soto',      'A2-005', 1),
    ('17.890.123-4', 'Nicole Salas',     'A2-006', 1);

-- Terminal 2: Colo Colo
INSERT INTO conductor (rut, nombre, licencia, id_terminal) VALUES
    ('18.901.234-5', 'Roberto Muñoz',   'A2-007', 2),
    ('19.012.345-6', 'Carolina Vega',   'A2-008', 2),
    ('20.123.456-7', 'Patricio Díaz',   'A2-009', 2);

-- Terminal 3: El Salto
INSERT INTO conductor (rut, nombre, licencia, id_terminal) VALUES
    ('21.234.567-8', 'Francisca Mora',  'A2-010', 3),
    ('22.345.678-9', 'Alejandro Ríos',  'A2-011', 3);

-- Terminal 4: Lo Echevers
INSERT INTO conductor (rut, nombre, licencia, id_terminal) VALUES
    ('23.456.789-0', 'Valentina Cruz',  'A2-012', 4),
    ('24.567.890-1', 'Eduardo Bravo',   'A2-013', 4),
    ('25.678.901-2', 'Camila Herrera',  'A2-014', 4);

-- Terminal 5: José Arrieta
INSERT INTO conductor (rut, nombre, licencia, id_terminal) VALUES
    ('26.789.012-3', 'Diego Fuentes',   'A2-015', 5),
    ('27.890.123-4', 'Lorena Araya',    'A2-016', 5);

-- Terminal 6: María Angélica
INSERT INTO conductor (rut, nombre, licencia, id_terminal) VALUES
    ('28.901.234-5', 'Gonzalo Tapia',   'A2-017', 6),
    ('29.012.345-6', 'Isabel Contreras','A2-018', 6),
    ('30.123.456-7', 'Felipe Núñez',    'A2-019', 6);

-- ── Rutas (recorridos reales de RBU / Red) ───────────────────────────────────
INSERT INTO ruta (codigo_recorrido, descripcion, frecuencia_min, id_terminal) VALUES
    ('406',  'Troncal US6: Maipú - Las Condes por Alameda',             3, 1),
    ('405c', 'Troncal US6: Pudahuel - Providencia por Pajaritos',       4, 1),
    ('418',  'Troncal US6: Cerrillos - Ñuñoa por Gran Avenida',         3, 1),
    ('421',  'Troncal US6: Maipú - La Reina por 5 de Abril',            4, 4),
    ('B12',  'Alimentador US4: Quilicura - Metro Vespucio Norte',       5, 1),
    ('B20',  'Alimentador US4: Huechuraba - Metro Zapadores',           4, 1),
    ('C01',  'Alimentador US4: Las Condes - Metro Tobalaba',            6, 5),
    ('B08',  'Alimentador US4: Renca - Metro Cal y Canto',              5, 2);

-- ── Usuarios del sistema ─────────────────────────────────────────────────────
-- Contraseña por defecto: "sicof2026" (hash bcrypt simulado con SHA256 para SQLite)
-- En producción usar bcrypt real
INSERT INTO usuario (username, password_hash, nombre, rol, id_terminal) VALUES
    ('cpizarro',  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_sicof2026', 'Carla Pizarro',   'Despachador', 1),
    ('rmuñoz',    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_sicof2026', 'Roberto Muñoz',   'Despachador', 2),
    ('vcruz',     'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_sicof2026', 'Valentina Cruz',  'Despachador', 4),
    ('pvera',     'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_sicof2026', 'Paula Vera',      'Admin COF',   NULL),
    ('imella',    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_sicof2026', 'Ignacio Mella',   'Admin TI',    NULL),
    ('admin',     'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_sicof2026', 'Administrador',   'Admin TI',    NULL);

-- ── Asignaciones activas (turno AM de hoy) ───────────────────────────────────
INSERT INTO asignacion (id_bus, id_conductor, id_terminal, id_ruta, fecha_hora_inicio) VALUES
    (1, 1, 1, 1, '2026-05-24T05:30:00'),  -- EB-214 / Carla Pizarro / 406
    (2, 2, 1, 2, '2026-05-24T05:30:00'),  -- EB-301 / Juan Rojas / 405c
    (6, 3, 1, 3, '2026-05-24T05:30:00'),  -- D-226  / Andrea Peña / 418
    (7, 4, 1, 5, '2026-05-24T05:30:00'),  -- D-118  / Mauricio Lagos / B12
    (3, 5, 1, 6, '2026-05-24T05:30:00'),  -- EB-455 / Daniel Soto / B20
    (8, 6, 1, 3, '2026-05-24T09:30:00');  -- D-287  / Nicole Salas / 418 (relevo)

-- ── Estado de carga inicial (buses eléctricos de El Roble) ───────────────────
INSERT INTO estado_carga (id_bus, nivel_carga, autonomia_km, timestamp) VALUES
    (1, 92.0, 180.0, '2026-05-24T05:20:00'),  -- EB-214: carga alta
    (2, 41.0,  78.0, '2026-05-24T05:20:00'),  -- EB-301: bajo umbral
    (3, 77.0, 148.0, '2026-05-24T05:20:00'),  -- EB-455: carga suficiente
    (4, 58.0, 110.0, '2026-05-24T05:20:00'),  -- EB-118: cargando
    (5, 35.0,  65.0, '2026-05-24T05:20:00');  -- EB-212: crítico

-- ── Posiciones GPS simuladas ─────────────────────────────────────────────────
INSERT INTO registro_gps (id_bus, coordenada_lat, coordenada_lon, velocidad_kmh, timestamp) VALUES
    (1, -33.3585, -70.7345, 0.0,  '2026-05-24T05:40:00'),  -- EB-214 en patio
    (1, -33.3620, -70.7310, 28.5, '2026-05-24T05:42:00'),  -- EB-214 saliendo
    (2, -33.3578, -70.7342, 0.0,  '2026-05-24T05:40:00'),  -- EB-301 en patio
    (6, -33.3582, -70.7338, 0.0,  '2026-05-24T05:45:00'),  -- D-226 en posición
    (7, -33.3575, -70.7350, 0.0,  '2026-05-24T05:40:00');  -- D-118 en patio

-- ── Incidentes del turno ─────────────────────────────────────────────────────
INSERT INTO incidente (id_bus, id_conductor, tipo, severidad, descripcion, coordenada_lat, coordenada_lon, estado, fecha_hora) VALUES
    (2, 2, 'Energía',       'Alta',  'SoC insuficiente para vuelta completa en servicio 405c. Requiere swap o reasignación.',         -33.3580, -70.7340, 'Escalado', '2026-05-24T05:35:00'),
    (7, 4, 'Mantenimiento', 'Media', 'Sensor de puerta reporta intermitencia. No bloquea reserva pero requiere revisión.',            -33.3575, -70.7350, 'Abierto',  '2026-05-24T05:50:00'),
    (1, 1, 'Vial',          'Media', 'Congestión en acceso Alameda. Se mantiene ruta con desvío sugerido, tiempo de paso controlado.', -33.4420, -70.6530, 'Abierto',  '2026-05-24T06:05:00');
