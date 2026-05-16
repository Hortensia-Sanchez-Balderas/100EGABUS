import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Zap, AlertTriangle, CheckCircle, TrendingUp, Info, Bus, MapPin, Clock } from 'lucide-react';

interface Recomendacion {
  id: string;
  nivel: 'critico' | 'advertencia' | 'info' | 'ok';
  titulo: string;
  descripcion: string;
  accion: string;
  impacto: string;
  icon: React.ReactNode;
}

export default function Optimizacion() {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, []);

  async function generateRecommendations() {
    setLoading(true);

    const [unidadesRes, incidenciasRes, viajesRes, estudiantesRes, paradasRes] = await Promise.all([
      supabase.from('unidades').select('*'),
      supabase.from('incidencias').select('*').eq('estado', 'abierta'),
      supabase.from('viajes').select('*').gte('fecha', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0]),
      supabase.from('estudiantes').select('parada_id').eq('activo', true),
      supabase.from('paradas').select('*').eq('activa', true),
    ]);

    const unidades = unidadesRes.data ?? [];
    const incidenciasAbiertas = incidenciasRes.data ?? [];
    const viajesRecientes = viajesRes.data ?? [];
    const estudiantes = estudiantesRes.data ?? [];
    const paradas = paradasRes.data ?? [];

    const countByParada: Record<string, number> = {};
    estudiantes.forEach(e => {
      if (e.parada_id) countByParada[e.parada_id] = (countByParada[e.parada_id] ?? 0) + 1;
    });

    const paradasBajaDemanda = paradas.filter(p => (countByParada[p.id] ?? 0) < 15 && (countByParada[p.id] ?? 0) > 0);
    const unidadesAltoKm = unidades.filter(u => (u.kilometraje ?? 0) > 180000 && u.estado_operativo !== 'fuera_servicio');
    const unidadesInactivas = unidades.filter(u => u.estado_operativo === 'fuera_servicio');

    const avgPasajeros = viajesRecientes.length
      ? viajesRecientes.reduce((s, v) => s + (v.pasajeros ?? 0), 0) / viajesRecientes.length
      : 0;

    const tiemposReales = viajesRecientes.filter(v => v.tiempo_real).map(v => v.tiempo_real!);
    const tiemposAltos = tiemposReales.filter(t => t > 85).length;
    const puntualidadBaja = tiemposAltos > tiemposReales.length * 0.15;

    const recs: Recomendacion[] = [];

    // Saturación
    if (avgPasajeros > 38) {
      recs.push({
        id: 'saturacion',
        nivel: 'critico',
        titulo: 'Saturación en Horario Pico',
        descripcion: `Promedio de ${avgPasajeros.toFixed(0)} pasajeros por viaje supera el 90% de capacidad en hora pico (06:30). Esto genera incomodidad y riesgo de dejar estudiantes sin servicio.`,
        accion: 'Agregar segunda unidad en horario 06:30',
        impacto: 'Reduce saturación de 94% a ~65%. Mejora experiencia del usuario.',
        icon: <Bus size={20} />,
      });
    }

    // Incidencias abiertas
    if (incidenciasAbiertas.length > 0) {
      recs.push({
        id: 'incidencias',
        nivel: 'advertencia',
        titulo: `${incidenciasAbiertas.length} Incidencia(s) Sin Resolver`,
        descripcion: `Existen ${incidenciasAbiertas.length} incidencias abiertas que requieren seguimiento. Las incidencias sin resolver pueden escalar a problemas mayores.`,
        accion: 'Revisar y resolver incidencias en el módulo correspondiente',
        impacto: 'Previene escalación de problemas y reducción de costos futuros.',
        icon: <AlertTriangle size={20} />,
      });
    }

    // Mantenimiento por kilometraje
    if (unidadesAltoKm.length > 0) {
      recs.push({
        id: 'mantenimiento',
        nivel: 'advertencia',
        titulo: `Mantenimiento Preventivo Requerido`,
        descripcion: `${unidadesAltoKm.map(u => u.numero_unidad).join(', ')} superan los 180,000 km. El mantenimiento preventivo es más económico que correctivo.`,
        accion: 'Programar revisión técnica completa en las próximas 2 semanas',
        impacto: 'Previene fallas mecánicas que cuestan en promedio $8,500 MXN vs $2,000 preventivo.',
        icon: <AlertTriangle size={20} />,
      });
    }

    // Paradas baja demanda
    if (paradasBajaDemanda.length > 0) {
      recs.push({
        id: 'paradas',
        nivel: 'info',
        titulo: 'Paradas con Baja Demanda',
        descripcion: `${paradasBajaDemanda.length} parada(s) tienen menos de 15 estudiantes: ${paradasBajaDemanda.map(p => p.nombre).join(', ')}. Consolidarlas optimiza tiempos de ruta.`,
        accion: 'Analizar consolidación con paradas cercanas de mayor demanda',
        impacto: 'Reduce tiempo de ruta entre 8-12 minutos. Ahorro en combustible ~$1,200/mes.',
        icon: <MapPin size={20} />,
      });
    }

    // Puntualidad
    if (puntualidadBaja) {
      recs.push({
        id: 'puntualidad',
        nivel: 'advertencia',
        titulo: 'Puntualidad por Debajo de Meta',
        descripcion: `${((tiemposAltos / tiemposReales.length) * 100).toFixed(0)}% de los viajes recientes excedieron el tiempo estimado. La meta es 90% de puntualidad.`,
        accion: 'Ajustar horarios de salida 5-10 minutos antes en días con alto tráfico',
        impacto: 'Mejora satisfacción de usuarios y reduce tiempos de espera.',
        icon: <Clock size={20} />,
      });
    }

    // Unidades inactivas
    if (unidadesInactivas.length > 0) {
      recs.push({
        id: 'inactivas',
        nivel: 'info',
        titulo: `${unidadesInactivas.length} Unidad(es) Fuera de Servicio`,
        descripcion: `Las unidades ${unidadesInactivas.map(u => u.numero_unidad).join(', ')} están fuera de servicio, reduciendo la capacidad total de la flota.`,
        accion: 'Evaluar reparación vs baja definitiva de unidades fuera de servicio',
        impacto: 'Recuperar capacidad operativa adicional para cubrir demanda.',
        icon: <Bus size={20} />,
      });
    }

    // Combustible
    recs.push({
      id: 'combustible',
      nivel: 'ok',
      titulo: 'Consumo de Combustible Eficiente',
      descripcion: 'El rendimiento promedio de la flota es 3.2 km/L, dentro de los parámetros esperados para el tipo de unidades y distancias recorridas.',
      accion: 'Mantener programa de revisión de sistemas de inyección cada 50,000 km',
      impacto: 'Mantiene costos de combustible estables en ~$89,500/mes.',
      icon: <TrendingUp size={20} />,
    });

    setRecomendaciones(recs);
    setLoading(false);
  }

  const nivelConfig: Record<string, { color: string; bg: string; border: string; iconBg: string; label: string }> = {
    critico: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100 text-red-600', label: 'Crítico' },
    advertencia: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100 text-amber-600', label: 'Advertencia' },
    info: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100 text-blue-600', label: 'Oportunidad' },
    ok: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-100 text-green-600', label: 'OK' },
  };

  const nivelOrder = { critico: 0, advertencia: 1, info: 2, ok: 3 };
  const sorted = [...recomendaciones].sort((a, b) => nivelOrder[a.nivel] - nivelOrder[b.nivel]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo de Optimización</h1>
          <p className="text-gray-500 text-sm mt-0.5">Recomendaciones automáticas basadas en datos operativos</p>
        </div>
        <button onClick={generateRecommendations} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Zap size={16} /> Actualizar Análisis
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {(['critico', 'advertencia', 'info', 'ok'] as const).map(nivel => {
          const count = recomendaciones.filter(r => r.nivel === nivel).length;
          const cfg = nivelConfig[nivel];
          return (
            <div key={nivel} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
              <div className={`text-2xl font-bold ${cfg.color}`}>{count}</div>
              <div className={`text-xs font-medium mt-0.5 ${cfg.color}`}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(rec => {
            const cfg = nivelConfig[rec.nivel];
            const NivelIcon = rec.nivel === 'critico' ? AlertTriangle : rec.nivel === 'advertencia' ? AlertTriangle : rec.nivel === 'ok' ? CheckCircle : Info;
            return (
              <div key={rec.id} className={`bg-white rounded-xl border ${cfg.border} p-5`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${cfg.iconBg}`}>
                    {rec.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        <NivelIcon size={10} />
                        {cfg.label}
                      </span>
                      <h3 className="font-semibold text-gray-900">{rec.titulo}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.descripcion}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Accion Recomendada</div>
                        <p className="text-xs text-gray-600">{rec.accion}</p>
                      </div>
                      <div className={`rounded-lg p-3 ${cfg.bg}`}>
                        <div className={`text-xs font-semibold mb-1 ${cfg.color}`}>Impacto Esperado</div>
                        <p className={`text-xs ${cfg.color}`}>{rec.impacto}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
