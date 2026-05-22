-- ============================================
-- QUERIES PARA CONFIGURAR MANTENIMIENTO EN SUPABASE
-- ============================================
-- Ejecuta estos queries en el SQL Editor de Supabase
-- en el orden indicado
-- ============================================

-- 1. Crear la tabla de mantenimientos
CREATE TABLE IF NOT EXISTS mantenimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('preventivo', 'correctivo', 'emergencia')),
  fecha_programada DATE NOT NULL,
  fecha_realizada DATE,
  descripcion TEXT NOT NULL,
  costo NUMERIC(10, 2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'completado', 'cancelado')) DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_mantenimientos_unidad ON mantenimientos(unidad_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_fecha_programada ON mantenimientos(fecha_programada);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_estado ON mantenimientos(estado);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_tipo ON mantenimientos(tipo);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de acceso para usuarios autenticados
-- Política para SELECT: todos los usuarios autenticados pueden leer
CREATE POLICY "Usuarios autenticados pueden leer mantenimientos"
  ON mantenimientos
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para INSERT: todos los usuarios autenticados pueden insertar
CREATE POLICY "Usuarios autenticados pueden insertar mantenimientos"
  ON mantenimientos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para UPDATE: todos los usuarios autenticados pueden actualizar
CREATE POLICY "Usuarios autenticados pueden actualizar mantenimientos"
  ON mantenimientos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para DELETE: todos los usuarios autenticados pueden eliminar
CREATE POLICY "Usuarios autenticados pueden eliminar mantenimientos"
  ON mantenimientos
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. (OPCIONAL) Insertar datos de ejemplo para probar el módulo
INSERT INTO mantenimientos (unidad_id, tipo, fecha_programada, descripcion, costo, estado)
VALUES
  ('101', 'preventivo', '2025-06-01', 'Cambio de aceite y filtros', 1500.00, 'pendiente'),
  ('102', 'correctivo', '2025-05-25', 'Reparación de frenos delanteros', 3500.00, 'pendiente'),
  ('103', 'preventivo', '2025-05-28', 'Revisión general de 10,000 km', 2000.00, 'pendiente'),
  ('101', 'emergencia', '2025-05-23', 'Cambio de llanta ponchada', 800.00, 'completado'),
  ('104', 'preventivo', '2025-06-05', 'Alineación y balanceo', 1200.00, 'pendiente');

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esta query para verificar que todo se creó correctamente:
SELECT
  COUNT(*) as total_mantenimientos,
  COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
  COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
  SUM(costo) as costo_total
FROM mantenimientos;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. La columna 'unidad_id' referencia a la tabla 'unidades' por el campo 'numero'
-- 2. Los tipos de mantenimiento son: 'preventivo', 'correctivo', 'emergencia'
-- 3. Los estados posibles son: 'pendiente', 'completado', 'cancelado'
-- 4. El campo 'fecha_realizada' es opcional y se llena cuando se completa el mantenimiento
-- 5. El campo 'notas' es opcional para información adicional
