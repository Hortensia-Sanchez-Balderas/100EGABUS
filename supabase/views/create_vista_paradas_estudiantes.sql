-- =====================================================
-- CREAR VISTA DINÁMICA: PARADAS CON ESTUDIANTES AGRUPADOS
-- =====================================================
-- Esta vista agrupa estudiantes por parada sin duplicar datos
-- Permite consultas dinámicas para saturación, demanda, etc.

CREATE OR REPLACE VIEW vista_paradas_estudiantes AS
SELECT
  p.id,
  p.nombre,
  p.ubicacion,
  p.coordenadas,
  p.ruta,
  p.capacidad,
  p.estado,
  COUNT(e.id) AS total_estudiantes,
  ROUND(100.0 * COUNT(e.id) / NULLIF(p.capacidad, 0))::INTEGER AS saturacion_porcentaje,
  json_agg(
    json_build_object(
      'id', e.id,
      'nombre', e.nombre,
      'escuela', e.escuela,
      'horario_ida', e.horario_ida,
      'horario_regreso', e.horario_regreso,
      'estado', e.estado
    )
  ) FILTER (WHERE e.id IS NOT NULL) AS estudiantes,
  -- Horarios más usados
  json_build_object(
    'ida', (SELECT e.horario_ida FROM estudiantes e WHERE e.parada_asignada = p.nombre GROUP BY e.horario_ida ORDER BY COUNT(*) DESC LIMIT 1),
    'regreso', (SELECT e.horario_regreso FROM estudiantes e WHERE e.parada_asignada = p.nombre GROUP BY e.horario_regreso ORDER BY COUNT(*) DESC LIMIT 1)
  ) AS horarios_pico,
  -- Escuelas más representadas
  json_agg(DISTINCT e.escuela) FILTER (WHERE e.id IS NOT NULL) AS escuelas,
  -- Fecha de última actualización
  NOW() AT TIME ZONE 'UTC' AS actualizado_en
FROM paradas p
LEFT JOIN estudiantes e
  ON p.nombre = e.parada_asignada AND e.estado = 'activo'
GROUP BY p.id, p.nombre, p.ubicacion, p.coordenadas, p.ruta, p.capacidad, p.estado
ORDER BY p.nombre;

-- =====================================================
-- COMENTARIOS Y ÍNDICES RECOMENDADOS
-- =====================================================

COMMENT ON VIEW vista_paradas_estudiantes IS 
'Vista dinámica que agrupa estudiantes por parada. Calcula saturación, horarios pico y escuelas. 
Se actualiza en tiempo real cada vez que se consulta.';

-- Para mejorar performance, crear índices en paradas y estudiantes
CREATE INDEX IF NOT EXISTS idx_estudiantes_parada_estado 
ON estudiantes(parada_asignada, estado);

CREATE INDEX IF NOT EXISTS idx_paradas_estado 
ON paradas(estado);

-- =====================================================
-- QUERIES DE EJEMPLO
-- =====================================================

-- 1. Ver todas las paradas con estudiantes
-- SELECT * FROM vista_paradas_estudiantes;

-- 2. Ver solo paradas con alta saturación (>80%)
-- SELECT id, nombre, total_estudiantes, saturacion_porcentaje 
-- FROM vista_paradas_estudiantes 
-- WHERE saturacion_porcentaje > 80;

-- 3. Ver horarios pico por parada
-- SELECT nombre, horarios_pico->'ida' as hora_ida, horarios_pico->'regreso' as hora_regreso
-- FROM vista_paradas_estudiantes;

-- 4. Ver escuelas por parada
-- SELECT nombre, escuelas
-- FROM vista_paradas_estudiantes;

-- 5. Ver estudiantes en parada específica
-- SELECT nombre, total_estudiantes, estudiantes
-- FROM vista_paradas_estudiantes
-- WHERE nombre = 'Villas de Alcalá OXXO';
