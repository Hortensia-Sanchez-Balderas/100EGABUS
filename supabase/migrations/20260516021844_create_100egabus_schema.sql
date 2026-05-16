
/*
  # 100EGABUS - Sistema Integral de Gestión de Transporte Estudiantil

  ## Descripción
  Esquema completo para el sistema de gestión del programa de transporte estudiantil gratuito
  del municipio de Ciénega de Flores, Nuevo León.

  ## Tablas Creadas
  1. **usuarios** - Gestión de acceso al sistema (admins y operadores)
  2. **paradas** - Puntos de abordaje con coordenadas
  3. **estudiantes** - Registro de beneficiarios del programa
  4. **rutas** - Rutas de transporte (completa/directa)
  5. **ruta_paradas** - Tabla pivote ruta-parada con orden
  6. **unidades** - Flota de autobuses
  7. **choferes** - Conductores asignados
  8. **viajes** - Registro operativo de viajes
  9. **incidencias** - Eventos operativos con costos
  10. **mantenimientos** - Historial de mantenimiento de unidades
  11. **gastos_operativos** - Control de gastos generales

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas basadas en autenticación JWT
*/

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL DEFAULT '',
  rol text NOT NULL DEFAULT 'operador' CHECK (rol IN ('administrador', 'operador')),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read usuarios"
  ON usuarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert usuarios"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update usuarios"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Tabla de paradas
CREATE TABLE IF NOT EXISTS paradas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  latitud decimal(10,8),
  longitud decimal(11,8),
  activa boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE paradas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read paradas"
  ON paradas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert paradas"
  ON paradas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update paradas"
  ON paradas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete paradas"
  ON paradas FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  escuela text NOT NULL,
  telefono text,
  semestre text,
  matricula text UNIQUE,
  estado_credencial text DEFAULT 'vigente' CHECK (estado_credencial IN ('vigente', 'vencida', 'pendiente')),
  fecha_vencimiento date,
  parada_id uuid REFERENCES paradas(id),
  horario_ida text,
  horario_regreso text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read estudiantes"
  ON estudiantes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert estudiantes"
  ON estudiantes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update estudiantes"
  ON estudiantes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete estudiantes"
  ON estudiantes FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de rutas
CREATE TABLE IF NOT EXISTS rutas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo_ruta text DEFAULT 'completa' CHECK (tipo_ruta IN ('completa', 'directa')),
  distancia_km decimal(6,2),
  tiempo_estimado integer,
  activa boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read rutas"
  ON rutas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert rutas"
  ON rutas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rutas"
  ON rutas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rutas"
  ON rutas FOR DELETE
  TO authenticated
  USING (true);

-- Tabla pivote ruta_paradas
CREATE TABLE IF NOT EXISTS ruta_paradas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id uuid NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
  parada_id uuid NOT NULL REFERENCES paradas(id) ON DELETE CASCADE,
  orden integer NOT NULL DEFAULT 0,
  UNIQUE(ruta_id, parada_id)
);

ALTER TABLE ruta_paradas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ruta_paradas"
  ON ruta_paradas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ruta_paradas"
  ON ruta_paradas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ruta_paradas"
  ON ruta_paradas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ruta_paradas"
  ON ruta_paradas FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de unidades
CREATE TABLE IF NOT EXISTS unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_unidad text UNIQUE NOT NULL,
  modelo text NOT NULL,
  capacidad integer NOT NULL DEFAULT 40,
  rendimiento_km_l decimal(4,2) DEFAULT 3.2,
  capacidad_tanque integer DEFAULT 250,
  kilometraje integer DEFAULT 0,
  estado_operativo text DEFAULT 'activa' CHECK (estado_operativo IN ('activa', 'mantenimiento', 'fuera_servicio')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read unidades"
  ON unidades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert unidades"
  ON unidades FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update unidades"
  ON unidades FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete unidades"
  ON unidades FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de choferes
CREATE TABLE IF NOT EXISTS choferes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text,
  licencia text UNIQUE NOT NULL,
  unidad_asignada uuid REFERENCES unidades(id),
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE choferes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read choferes"
  ON choferes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert choferes"
  ON choferes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update choferes"
  ON choferes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete choferes"
  ON choferes FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de viajes
CREATE TABLE IF NOT EXISTS viajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  hora_salida time,
  hora_llegada time,
  ruta_id uuid REFERENCES rutas(id),
  unidad_id uuid REFERENCES unidades(id),
  chofer_id uuid REFERENCES choferes(id),
  pasajeros integer DEFAULT 0,
  gasolina_consumida decimal(6,2) DEFAULT 0,
  tiempo_real integer,
  observaciones text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read viajes"
  ON viajes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert viajes"
  ON viajes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update viajes"
  ON viajes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete viajes"
  ON viajes FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de incidencias
CREATE TABLE IF NOT EXISTS incidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('ponchadura', 'falla_mecanica', 'retraso', 'trafico', 'accidente')),
  descripcion text,
  costo decimal(10,2) DEFAULT 0,
  unidad_id uuid REFERENCES unidades(id),
  viaje_id uuid REFERENCES viajes(id),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  estado text DEFAULT 'abierta' CHECK (estado IN ('abierta', 'en_proceso', 'resuelta')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read incidencias"
  ON incidencias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert incidencias"
  ON incidencias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update incidencias"
  ON incidencias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete incidencias"
  ON incidencias FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de mantenimientos
CREATE TABLE IF NOT EXISTS mantenimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id uuid NOT NULL REFERENCES unidades(id),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  descripcion text NOT NULL,
  costo decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mantenimientos"
  ON mantenimientos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert mantenimientos"
  ON mantenimientos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mantenimientos"
  ON mantenimientos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete mantenimientos"
  ON mantenimientos FOR DELETE
  TO authenticated
  USING (true);

-- Tabla de gastos operativos
CREATE TABLE IF NOT EXISTS gastos_operativos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concepto text NOT NULL,
  monto decimal(10,2) NOT NULL DEFAULT 0,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  categoria text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gastos_operativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read gastos_operativos"
  ON gastos_operativos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert gastos_operativos"
  ON gastos_operativos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gastos_operativos"
  ON gastos_operativos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gastos_operativos"
  ON gastos_operativos FOR DELETE
  TO authenticated
  USING (true);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_estudiantes_parada ON estudiantes(parada_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_activo ON estudiantes(activo);
CREATE INDEX IF NOT EXISTS idx_viajes_fecha ON viajes(fecha);
CREATE INDEX IF NOT EXISTS idx_viajes_ruta ON viajes(ruta_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_fecha ON incidencias(fecha);
CREATE INDEX IF NOT EXISTS idx_incidencias_unidad ON incidencias(unidad_id);
