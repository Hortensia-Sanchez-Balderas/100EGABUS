
/*
  # Seed Data para 100EGABUS

  Datos iniciales realistas para el sistema de transporte estudiantil.
  Incluye paradas, rutas, unidades, choferes, y registros operativos.
*/

-- Insertar usuarios del sistema (contraseñas hasheadas se manejan via Supabase Auth)
INSERT INTO usuarios (nombre, email, rol) VALUES
  ('Carlos Mendoza', 'admin@100egabus.mx', 'administrador'),
  ('Laura Torres', 'operador@100egabus.mx', 'operador')
ON CONFLICT (email) DO NOTHING;

-- Insertar paradas reales de Ciénega de Flores
INSERT INTO paradas (nombre, latitud, longitud, activa) VALUES
  ('Parada Central - Plaza Principal', 25.9574, -100.1756, true),
  ('Col. Lomas Verdes', 25.9612, -100.1823, true),
  ('Av. Benito Juárez - Norte', 25.9548, -100.1698, true),
  ('Col. Las Palmas', 25.9489, -100.1765, true),
  ('Fracc. Santa Elena', 25.9632, -100.1901, true),
  ('Col. Jardines del Valle', 25.9521, -100.1834, true),
  ('Av. Principal - Sur', 25.9467, -100.1712, true),
  ('Col. Nueva Esperanza', 25.9583, -100.1678, true),
  ('Estación Sendero (Destino)', 25.7834, -100.3456, true),
  ('Col. Residencial', 25.9601, -100.1789, true)
ON CONFLICT DO NOTHING;

-- Insertar rutas
INSERT INTO rutas (nombre, tipo_ruta, distancia_km, tiempo_estimado, activa) VALUES
  ('Ruta A - Completa Matutina', 'completa', 42.5, 75, true),
  ('Ruta B - Directa Vespertina', 'directa', 38.2, 55, true),
  ('Ruta C - Completa Tarde', 'completa', 42.5, 80, true),
  ('Ruta D - Regreso Sendero', 'directa', 38.2, 50, true)
ON CONFLICT DO NOTHING;

-- Insertar unidades
INSERT INTO unidades (numero_unidad, modelo, capacidad, rendimiento_km_l, capacidad_tanque, kilometraje, estado_operativo) VALUES
  ('U-001', 'Mercedes Benz O500 2019', 45, 3.4, 250, 124580, 'activa'),
  ('U-002', 'Volkswagen 17.230 OD 2020', 42, 3.1, 250, 98340, 'activa'),
  ('U-003', 'Scania K360 2018', 48, 3.2, 280, 187650, 'activa'),
  ('U-004', 'Mercedes Benz O500 2021', 45, 3.6, 250, 45230, 'activa'),
  ('U-005', 'Volkswagen 17.230 OD 2017', 42, 2.9, 250, 234780, 'mantenimiento'),
  ('U-006', 'Scania K360 2022', 50, 3.8, 280, 12450, 'activa')
ON CONFLICT (numero_unidad) DO NOTHING;

-- Insertar choferes
INSERT INTO choferes (nombre, telefono, licencia, activo) VALUES
  ('Roberto García Pérez', '81-2345-6789', 'NL-2019-001234', true),
  ('Miguel Hernández Luna', '81-3456-7890', 'NL-2018-005678', true),
  ('Juan Carlos Reyes', '81-4567-8901', 'NL-2020-009012', true),
  ('Alejandro Morales', '81-5678-9012', 'NL-2017-003456', true),
  ('Fernando López Soto', '81-6789-0123', 'NL-2021-007890', true)
ON CONFLICT (licencia) DO NOTHING;

-- Insertar estudiantes de muestra
DO $$
DECLARE
  parada1_id uuid;
  parada2_id uuid;
  parada3_id uuid;
  parada4_id uuid;
  parada5_id uuid;
BEGIN
  SELECT id INTO parada1_id FROM paradas WHERE nombre = 'Parada Central - Plaza Principal' LIMIT 1;
  SELECT id INTO parada2_id FROM paradas WHERE nombre = 'Col. Lomas Verdes' LIMIT 1;
  SELECT id INTO parada3_id FROM paradas WHERE nombre = 'Av. Benito Juárez - Norte' LIMIT 1;
  SELECT id INTO parada4_id FROM paradas WHERE nombre = 'Col. Las Palmas' LIMIT 1;
  SELECT id INTO parada5_id FROM paradas WHERE nombre = 'Fracc. Santa Elena' LIMIT 1;

  INSERT INTO estudiantes (nombre_completo, escuela, telefono, semestre, matricula, estado_credencial, fecha_vencimiento, parada_id, horario_ida, horario_regreso, activo) VALUES
    ('Ana Patricia González', 'UANL - FCA', '81-1234-5678', '4to', 'MAT-2024-001', 'vigente', '2025-12-31', parada1_id, '06:30', '14:00', true),
    ('Luis Fernando Martínez', 'ITESM Campus Monterrey', '81-2345-6789', '3er', 'MAT-2024-002', 'vigente', '2025-12-31', parada2_id, '06:30', '18:00', true),
    ('María José Rodríguez', 'UANL - FIME', '81-3456-7890', '5to', 'MAT-2024-003', 'vigente', '2025-06-30', parada1_id, '07:00', '14:00', true),
    ('Carlos Alberto Vega', 'CETIS 76', '81-4567-8901', '2do', 'MAT-2024-004', 'pendiente', '2025-03-31', parada3_id, '06:30', '13:30', true),
    ('Sofía Alejandra Ruiz', 'UANL - FCB', '81-5678-9012', '6to', 'MAT-2024-005', 'vigente', '2025-12-31', parada4_id, '07:00', '18:00', true),
    ('Diego Emmanuel Torres', 'CBETIS 168', '81-6789-0123', '3er', 'MAT-2024-006', 'vigente', '2025-12-31', parada5_id, '06:30', '13:30', true),
    ('Valeria Nájera López', 'UANL - FCA', '81-7890-1234', '2do', 'MAT-2024-007', 'vencida', '2024-12-31', parada2_id, '07:00', '14:00', true),
    ('Ricardo Sandoval', 'ITESM Campus Monterrey', '81-8901-2345', '4to', 'MAT-2024-008', 'vigente', '2025-12-31', parada1_id, '06:30', '18:00', true),
    ('Isabella Moreno Cruz', 'UANL - FIME', '81-9012-3456', '1er', 'MAT-2024-009', 'vigente', '2025-12-31', parada3_id, '07:00', '14:00', true),
    ('Andrés Felipe Castillo', 'CETIS 76', '81-0123-4567', '4to', 'MAT-2024-010', 'vigente', '2025-06-30', parada4_id, '06:30', '13:30', true)
  ON CONFLICT (matricula) DO NOTHING;
END $$;

-- Insertar viajes recientes (últimos 7 días)
DO $$
DECLARE
  ruta1_id uuid;
  ruta2_id uuid;
  unidad1_id uuid;
  unidad2_id uuid;
  unidad3_id uuid;
  chofer1_id uuid;
  chofer2_id uuid;
  chofer3_id uuid;
BEGIN
  SELECT id INTO ruta1_id FROM rutas WHERE nombre = 'Ruta A - Completa Matutina' LIMIT 1;
  SELECT id INTO ruta2_id FROM rutas WHERE nombre = 'Ruta B - Directa Vespertina' LIMIT 1;
  SELECT id INTO unidad1_id FROM unidades WHERE numero_unidad = 'U-001' LIMIT 1;
  SELECT id INTO unidad2_id FROM unidades WHERE numero_unidad = 'U-002' LIMIT 1;
  SELECT id INTO unidad3_id FROM unidades WHERE numero_unidad = 'U-003' LIMIT 1;
  SELECT id INTO chofer1_id FROM choferes WHERE licencia = 'NL-2019-001234' LIMIT 1;
  SELECT id INTO chofer2_id FROM choferes WHERE licencia = 'NL-2018-005678' LIMIT 1;
  SELECT id INTO chofer3_id FROM choferes WHERE licencia = 'NL-2020-009012' LIMIT 1;

  INSERT INTO viajes (fecha, hora_salida, hora_llegada, ruta_id, unidad_id, chofer_id, pasajeros, gasolina_consumida, tiempo_real, observaciones) VALUES
    (CURRENT_DATE, '06:30', '07:45', ruta1_id, unidad1_id, chofer1_id, 43, 12.5, 75, 'Viaje sin novedades'),
    (CURRENT_DATE, '06:30', '07:50', ruta1_id, unidad2_id, chofer2_id, 40, 13.1, 80, 'Tráfico moderado en av. principal'),
    (CURRENT_DATE, '07:00', '08:10', ruta1_id, unidad3_id, chofer3_id, 38, 13.3, 70, NULL),
    (CURRENT_DATE - 1, '06:30', '07:42', ruta1_id, unidad1_id, chofer1_id, 45, 12.5, 72, 'Viaje completo'),
    (CURRENT_DATE - 1, '06:30', '07:55', ruta1_id, unidad2_id, chofer2_id, 42, 13.7, 85, 'Retraso por cierre de calle'),
    (CURRENT_DATE - 2, '06:30', '07:44', ruta1_id, unidad1_id, chofer1_id, 44, 12.2, 74, NULL),
    (CURRENT_DATE - 2, '14:00', '15:05', ruta2_id, unidad1_id, chofer1_id, 38, 11.2, 65, 'Regreso vespertino'),
    (CURRENT_DATE - 3, '06:30', '07:40', ruta1_id, unidad1_id, chofer1_id, 41, 12.5, 70, NULL),
    (CURRENT_DATE - 3, '14:00', '15:00', ruta2_id, unidad2_id, chofer2_id, 35, 10.5, 60, NULL),
    (CURRENT_DATE - 4, '06:30', '07:48', ruta1_id, unidad3_id, chofer3_id, 47, 13.2, 78, 'Alta ocupación'),
    (CURRENT_DATE - 5, '06:30', '07:35', ruta1_id, unidad1_id, chofer1_id, 39, 11.8, 65, NULL),
    (CURRENT_DATE - 6, '06:30', '07:52', ruta1_id, unidad2_id, chofer2_id, 44, 13.4, 82, NULL)
  ON CONFLICT DO NOTHING;
END $$;

-- Insertar incidencias
DO $$
DECLARE
  unidad1_id uuid;
  unidad2_id uuid;
  unidad5_id uuid;
BEGIN
  SELECT id INTO unidad1_id FROM unidades WHERE numero_unidad = 'U-001' LIMIT 1;
  SELECT id INTO unidad2_id FROM unidades WHERE numero_unidad = 'U-002' LIMIT 1;
  SELECT id INTO unidad5_id FROM unidades WHERE numero_unidad = 'U-005' LIMIT 1;

  INSERT INTO incidencias (tipo, descripcion, costo, unidad_id, fecha, estado) VALUES
    ('retraso', 'Tráfico intenso en Av. Benito Juárez por obras', 0, unidad2_id, CURRENT_DATE - 1, 'resuelta'),
    ('ponchadura', 'Llanta trasera derecha ponchada en parada Las Palmas', 850, unidad1_id, CURRENT_DATE - 3, 'resuelta'),
    ('falla_mecanica', 'Falla en sistema de frenos, requirió revisión', 3200, unidad5_id, CURRENT_DATE - 7, 'resuelta'),
    ('trafico', 'Cierre parcial de carretera federal por accidente externo', 0, unidad2_id, CURRENT_DATE - 2, 'resuelta'),
    ('retraso', 'Estudiante olvidó credencial, regresó a domicilio', 0, unidad1_id, CURRENT_DATE, 'abierta'),
    ('falla_mecanica', 'Ruido en motor, pendiente revisión técnica', 0, unidad5_id, CURRENT_DATE - 14, 'en_proceso')
  ON CONFLICT DO NOTHING;
END $$;

-- Insertar mantenimientos
DO $$
DECLARE
  unidad1_id uuid;
  unidad3_id uuid;
  unidad5_id uuid;
BEGIN
  SELECT id INTO unidad1_id FROM unidades WHERE numero_unidad = 'U-001' LIMIT 1;
  SELECT id INTO unidad3_id FROM unidades WHERE numero_unidad = 'U-003' LIMIT 1;
  SELECT id INTO unidad5_id FROM unidades WHERE numero_unidad = 'U-005' LIMIT 1;

  INSERT INTO mantenimientos (unidad_id, fecha, descripcion, costo) VALUES
    (unidad1_id, CURRENT_DATE - 15, 'Cambio de aceite y filtros. Revisión general.', 1850),
    (unidad3_id, CURRENT_DATE - 20, 'Cambio de frenos delanteros y traseros', 4200),
    (unidad5_id, CURRENT_DATE - 7, 'Diagnóstico de falla en sistema de frenos. Reparación mayor.', 8500),
    (unidad1_id, CURRENT_DATE - 45, 'Revisión preventiva 125,000 km', 3200),
    (unidad3_id, CURRENT_DATE - 60, 'Cambio de neumáticos completos', 12400)
  ON CONFLICT DO NOTHING;
END $$;

-- Insertar gastos operativos del mes
INSERT INTO gastos_operativos (concepto, monto, fecha, categoria) VALUES
  ('Combustible - Semana 1', 28500, date_trunc('month', CURRENT_DATE)::date + 6, 'combustible'),
  ('Combustible - Semana 2', 31200, date_trunc('month', CURRENT_DATE)::date + 13, 'combustible'),
  ('Combustible - Semana 3', 29800, date_trunc('month', CURRENT_DATE)::date + 20, 'combustible'),
  ('Mantenimiento preventivo U-001', 1850, date_trunc('month', CURRENT_DATE)::date + 15, 'mantenimiento'),
  ('Reparación frenos U-003', 4200, date_trunc('month', CURRENT_DATE)::date + 10, 'mantenimiento'),
  ('Sueldos choferes - Quincena 1', 18500, date_trunc('month', CURRENT_DATE)::date + 15, 'nomina'),
  ('Sueldos choferes - Quincena 2', 18500, date_trunc('month', CURRENT_DATE)::date + 28, 'nomina'),
  ('Seguros vehículos', 4200, date_trunc('month', CURRENT_DATE)::date + 1, 'administrativo'),
  ('Servicios administrativos', 1200, date_trunc('month', CURRENT_DATE)::date + 1, 'administrativo')
ON CONFLICT DO NOTHING;
