export type UserRole = 'administrador' | 'operador';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  created_at: string;
}

export interface Parada {
  id: string;
  nombre: string;
  latitud?: number;
  longitud?: number;
  activa: boolean;
  created_at: string;
  _count?: { estudiantes: number };
}

export interface Estudiante {
  id: string;
  nombre_completo: string;
  escuela: string;
  telefono?: string;
  semestre?: string;
  matricula?: string;
  estado_credencial: 'vigente' | 'vencida' | 'pendiente';
  fecha_vencimiento?: string;
  parada_id?: string;
  horario_ida?: string;
  horario_regreso?: string;
  activo: boolean;
  created_at: string;
  paradas?: Parada;
}

export interface Ruta {
  id: string;
  nombre: string;
  tipo_ruta: 'completa' | 'directa';
  distancia_km?: number;
  tiempo_estimado?: number;
  activa: boolean;
  created_at: string;
}

export interface Unidad {
  id: string;
  numero_unidad: string;
  modelo: string;
  capacidad: number;
  rendimiento_km_l?: number;
  capacidad_tanque?: number;
  kilometraje?: number;
  estado_operativo: 'activa' | 'mantenimiento' | 'fuera_servicio';
  created_at: string;
}

export interface Chofer {
  id: string;
  nombre: string;
  telefono?: string;
  licencia: string;
  unidad_asignada?: string;
  activo: boolean;
  created_at: string;
  unidades?: Unidad;
}

export interface Viaje {
  id: string;
  fecha: string;
  hora_salida?: string;
  hora_llegada?: string;
  ruta_id?: string;
  unidad_id?: string;
  chofer_id?: string;
  pasajeros?: number;
  gasolina_consumida?: number;
  tiempo_real?: number;
  observaciones?: string;
  created_at: string;
  rutas?: Ruta;
  unidades?: Unidad;
  choferes?: Chofer;
}

export interface Incidencia {
  id: string;
  tipo: 'ponchadura' | 'falla_mecanica' | 'retraso' | 'trafico' | 'accidente';
  descripcion?: string;
  costo?: number;
  unidad_id?: string;
  viaje_id?: string;
  fecha: string;
  estado: 'abierta' | 'en_proceso' | 'resuelta';
  created_at: string;
  unidades?: Unidad;
}

export interface Mantenimiento {
  id: string;
  unidad_id: string;
  fecha: string;
  descripcion: string;
  costo?: number;
  created_at: string;
  unidades?: Unidad;
}

export interface GastoOperativo {
  id: string;
  concepto: string;
  monto: number;
  fecha: string;
  categoria: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    nombre?: string;
    rol?: UserRole;
  };
}
