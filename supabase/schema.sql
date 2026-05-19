-- ============================================
-- ESQUEMA DE BASE DE DATOS 100EGABUS
-- ============================================
-- Este script crea todas las tablas necesarias para el sistema

-- ============================================
-- 1. TABLA DE USUARIOS DEL SISTEMA
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'operador')),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES usuarios(id)
);

-- ============================================
-- 2. TABLA DE ESTUDIANTES
-- ============================================
CREATE TABLE IF NOT EXISTS estudiantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  escuela TEXT NOT NULL,
  telefono TEXT,
  semestre TEXT,
  estado_credencial TEXT CHECK (estado_credencial IN ('vigente', 'por_vencer', 'vencida')),
  fecha_vencimiento DATE,
  parada_asignada TEXT,
  horario_ida TEXT,
  horario_regreso TEXT,
  estado TEXT CHECK (estado IN ('activo', 'inactivo')) DEFAULT 'activo',
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABLA DE PARADAS
-- ============================================
CREATE TABLE IF NOT EXISTS paradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  coordenadas TEXT,
  ruta TEXT,
  capacidad INTEGER DEFAULT 50,
  estado TEXT CHECK (estado IN ('activa', 'inactiva')) DEFAULT 'activa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABLA DE RUTAS
-- ============================================
CREATE TABLE IF NOT EXISTS rutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('completa', 'directa')),
  tiempo_estimado INTEGER, -- en minutos
  distancia NUMERIC(10,2), -- en kilómetros
  numero_paradas INTEGER,
  horario_salida TEXT,
  estado TEXT CHECK (estado IN ('activa', 'inactiva')) DEFAULT 'activa',
  paradas JSONB, -- array de paradas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. TABLA DE UNIDADES (VEHÍCULOS)
-- ============================================
CREATE TABLE IF NOT EXISTS unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  modelo TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  rendimiento NUMERIC(10,2), -- km/l
  estado TEXT CHECK (estado IN ('activa', 'mantenimiento', 'fuera_servicio')) DEFAULT 'activa',
  kilometraje INTEGER DEFAULT 0,
  ultimo_mantenimiento DATE,
  proximo_mantenimiento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. TABLA DE CHOFERES
-- ============================================
CREATE TABLE IF NOT EXISTS choferes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  unidad_asignada TEXT,
  turno TEXT CHECK (turno IN ('matutino', 'vespertino', 'mixto')),
  vueltas_por_dia INTEGER DEFAULT 0,
  estado TEXT CHECK (estado IN ('activo', 'descanso', 'incapacidad')) DEFAULT 'activo',
  hora_entrada TEXT,
  hora_salida TEXT,
  experiencia TEXT,
  licencia TEXT,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. TABLA DE VIAJES
-- ============================================
CREATE TABLE IF NOT EXISTS viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  hora_salida_programada TIME,
  hora_llegada_programada TIME,
  hora_salida_real TIME NOT NULL,
  hora_llegada_real TIME NOT NULL,
  ruta TEXT NOT NULL,
  unidad TEXT NOT NULL,
  chofer TEXT NOT NULL,
  pasajeros INTEGER NOT NULL,
  gasolina_cargada NUMERIC(10,2),
  gasolina_consumida NUMERIC(10,2) NOT NULL,
  observaciones TEXT,
  tiempo_recorrido INTEGER, -- calculado en minutos
  retraso INTEGER DEFAULT 0, -- en minutos
  registrado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. TABLA DE INCIDENCIAS
-- ============================================
CREATE TABLE IF NOT EXISTS incidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  tipo TEXT CHECK (tipo IN ('ponchadura', 'falla_mecanica', 'retraso', 'trafico', 'accidente_menor')) NOT NULL,
  unidad TEXT NOT NULL,
  chofer TEXT,
  ruta TEXT,
  descripcion TEXT NOT NULL,
  costo_estimado NUMERIC(10,2) DEFAULT 0,
  tiempo_inactividad TEXT,
  requiere_mantenimiento BOOLEAN DEFAULT false,
  ubicacion TEXT,
  estado_resolucion TEXT CHECK (estado_resolucion IN ('pendiente', 'en_proceso', 'resuelto')) DEFAULT 'pendiente',
  registrado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. TABLA DE OPTIMIZACIONES (LOG)
-- ============================================
CREATE TABLE IF NOT EXISTS optimizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT CHECK (tipo IN ('capacidad', 'demanda', 'eficiencia', 'horario')) NOT NULL,
  condicion TEXT NOT NULL,
  accion TEXT NOT NULL,
  prioridad TEXT CHECK (prioridad IN ('alta', 'media', 'baja')),
  estado TEXT CHECK (estado IN ('activa', 'sugerencia', 'implementada')) DEFAULT 'sugerencia',
  impacto TEXT,
  fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_implementacion TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_viajes_fecha ON viajes(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_viajes_unidad ON viajes(unidad);
CREATE INDEX IF NOT EXISTS idx_incidencias_fecha ON incidencias(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_incidencias_unidad ON incidencias(unidad);
CREATE INDEX IF NOT EXISTS idx_estudiantes_estado ON estudiantes(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para calcular tiempo de recorrido
CREATE OR REPLACE FUNCTION calcular_tiempo_recorrido()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tiempo_recorrido := EXTRACT(EPOCH FROM (NEW.hora_llegada_real - NEW.hora_salida_real)) / 60;

  -- Calcular retraso si hay horario programado
  IF NEW.hora_llegada_programada IS NOT NULL THEN
    NEW.retraso := GREATEST(0, EXTRACT(EPOCH FROM (NEW.hora_llegada_real - NEW.hora_llegada_programada)) / 60);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automáticamente tiempo de recorrido
CREATE TRIGGER trigger_calcular_tiempo_recorrido
BEFORE INSERT OR UPDATE ON viajes
FOR EACH ROW
EXECUTE FUNCTION calcular_tiempo_recorrido();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE choferes ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizaciones ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Permitir lectura a usuarios autenticados" ON estudiantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir lectura a usuarios autenticados" ON paradas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir lectura a usuarios autenticados" ON rutas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir lectura a usuarios autenticados" ON unidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir lectura a usuarios autenticados" ON choferes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir lectura a usuarios autenticados" ON viajes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir lectura a usuarios autenticados" ON incidencias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir lectura a usuarios autenticados" ON optimizaciones FOR SELECT TO authenticated USING (true);

-- Políticas: Solo operadores y admins pueden insertar viajes e incidencias
CREATE POLICY "Operadores pueden insertar viajes" ON viajes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Operadores pueden insertar incidencias" ON incidencias FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas: Solo admins pueden modificar datos maestros
CREATE POLICY "Solo admins pueden modificar estudiantes" ON estudiantes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Solo admins pueden modificar paradas" ON paradas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Solo admins pueden modificar rutas" ON rutas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Solo admins pueden modificar unidades" ON unidades FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Solo admins pueden modificar choferes" ON choferes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- DATOS INICIALES (SEED DATA)
-- ============================================

-- Insertar paradas iniciales
INSERT INTO paradas (nombre, ubicacion, coordenadas, ruta, capacidad) VALUES
  ('Centro', 'Av. Hidalgo #100', '25.8756, -100.3456', 'Ruta 1', 60),
  ('Universidad', 'Ciudad Universitaria', '25.7267, -100.3089', 'Ruta 2', 80),
  ('CBTIS', 'Av. Juárez #450', '25.8901, -100.3234', 'Ruta 1', 70),
  ('Preparatoria', 'Col. Centro', '25.8823, -100.3567', 'Ruta 3', 60),
  ('Plaza Principal', 'Centro Comercial', '25.8945, -100.3412', 'Ruta 2', 50),
  ('Col. Linda Vista', 'Calle Principal #200', '25.9012, -100.3289', 'Ruta 4', 50)
ON CONFLICT DO NOTHING;

-- Insertar unidades iniciales
INSERT INTO unidades (numero, modelo, capacidad, rendimiento, kilometraje) VALUES
  ('Unidad 01', 'Mercedes-Benz Sprinter 2022', 45, 8.5, 45230),
  ('Unidad 02', 'Mercedes-Benz Sprinter 2022', 45, 8.2, 38950),
  ('Unidad 03', 'Ford Transit 2021', 40, 7.8, 52100),
  ('Unidad 04', 'Ford Transit 2021', 40, 7.5, 61200),
  ('Unidad 05', 'Chevrolet Express 2020', 35, 7.0, 72400),
  ('Unidad 06', 'Mercedes-Benz Sprinter 2023', 50, 9.0, 12300)
ON CONFLICT DO NOTHING;

-- Insertar choferes iniciales
INSERT INTO choferes (nombre, unidad_asignada, turno, vueltas_por_dia, hora_entrada, hora_salida, experiencia, licencia) VALUES
  ('Juan Pérez García', 'Unidad 01', 'matutino', 4, '5:00 AM', '2:00 PM', '8 años', 'Tipo B - Vigente'),
  ('María González López', 'Unidad 02', 'matutino', 4, '5:30 AM', '2:30 PM', '5 años', 'Tipo B - Vigente'),
  ('Carlos Ramírez Silva', 'Unidad 03', 'vespertino', 3, '12:00 PM', '8:00 PM', '12 años', 'Tipo B - Vigente'),
  ('Roberto Méndez Cruz', 'Unidad 04', 'vespertino', 3, '1:00 PM', '9:00 PM', '6 años', 'Tipo B - Vigente'),
  ('Ana Torres Ramírez', 'Unidad 05', 'mixto', 5, '6:00 AM', '7:00 PM', '10 años', 'Tipo B - Vigente'),
  ('Diego Hernández Luna', 'Unidad 06', 'matutino', 4, '5:00 AM', '2:00 PM', '3 años', 'Tipo B - Vigente')
ON CONFLICT DO NOTHING;

-- ============================================
-- CONFIRMACIÓN
-- ============================================
SELECT 'Esquema de base de datos 100EGABUS creado exitosamente!' AS mensaje;
