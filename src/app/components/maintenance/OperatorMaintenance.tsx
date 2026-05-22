import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AlertTriangle, Calendar, DollarSign, Wrench, Clock } from 'lucide-react';

interface Mantenimiento {
  id: string;
  unidad_id: string;
  tipo: 'preventivo' | 'correctivo' | 'emergencia';
  fecha_programada: string;
  descripcion: string;
  costo: number;
  estado: 'pendiente' | 'completado' | 'cancelado';
  notas: string | null;
}

export function OperatorMaintenance() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMantenimientos();
  }, []);

  const loadMantenimientos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mantenimientos')
        .select('*')
        .eq('estado', 'pendiente')
        .order('fecha_programada', { ascending: true });

      if (error) {
        console.error('Error loading mantenimientos:', error);
        alert('Error al cargar mantenimientos: ' + error.message);
      } else {
        setMantenimientos(data || []);
      }
    } catch (error) {
      console.error('Error loading mantenimientos:', error);
      alert('Error al cargar mantenimientos');
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'preventivo':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'correctivo':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'emergencia':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'preventivo':
        return <Calendar className="w-5 h-5" />;
      case 'correctivo':
        return <Wrench className="w-5 h-5" />;
      case 'emergencia':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  const getUrgencia = (fecha: string) => {
    const hoy = new Date();
    const fechaProgramada = new Date(fecha);
    const diffTime = fechaProgramada.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { texto: 'Atrasado', color: 'bg-red-500' };
    if (diffDays === 0) return { texto: 'Hoy', color: 'bg-red-500' };
    if (diffDays <= 3) return { texto: `${diffDays} días`, color: 'bg-orange-500' };
    if (diffDays <= 7) return { texto: `${diffDays} días`, color: 'bg-yellow-500' };
    return { texto: `${diffDays} días`, color: 'bg-green-500' };
  };

  const mantenimientosProximos = mantenimientos.filter((m) => {
    const diffDays = Math.ceil((new Date(m.fecha_programada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  const costoTotal = mantenimientos.reduce((sum, m) => sum + m.costo, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-800">Alertas de Mantenimiento</h1>
        <p className="text-gray-600 mt-1">Mantenimientos programados y alertas operativas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Mantenimientos Pendientes</p>
              <p className="text-3xl font-bold mt-1">{mantenimientos.length}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Próximos 7 días</p>
              <p className="text-3xl font-bold mt-1">{mantenimientosProximos.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Costo Estimado</p>
              <p className="text-3xl font-bold mt-1">${costoTotal.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Alertas Urgentes */}
      {mantenimientosProximos.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">Alertas Urgentes - Próximos 7 días</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mantenimientosProximos.map((mant) => {
              const urgencia = getUrgencia(mant.fecha_programada);
              return (
                <div
                  key={mant.id}
                  className="bg-white rounded-lg p-4 border-2 border-red-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${urgencia.color}`}>
                        {urgencia.texto}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTipoColor(mant.tipo)}`}>
                        {mant.tipo}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{mant.unidad_id}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{mant.descripcion}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>📅 {new Date(mant.fecha_programada).toLocaleDateString('es-MX')}</span>
                    <span className="font-bold text-red-700">💰 ${mant.costo.toLocaleString()}</span>
                  </div>
                  {mant.notas && (
                    <p className="text-xs text-gray-500 mt-2 italic">📝 {mant.notas}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Todos los Mantenimientos Pendientes */}
      <div className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-4">
          <h2 className="text-xl font-bold">Todos los Mantenimientos Programados</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando mantenimientos...</div>
        ) : mantenimientos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p>No hay mantenimientos pendientes</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {mantenimientos.map((mant) => {
              const urgencia = getUrgencia(mant.fecha_programada);
              return (
                <div
                  key={mant.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-lg border-2 ${getTipoColor(mant.tipo)}`}>
                      {getTipoIcon(mant.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-lg text-emerald-700">{mant.unidad_id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTipoColor(mant.tipo)}`}>
                          {mant.tipo.charAt(0).toUpperCase() + mant.tipo.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${urgencia.color}`}>
                          {urgencia.texto}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{mant.descripcion}</p>
                      {mant.notas && (
                        <p className="text-xs text-gray-500 italic">📝 {mant.notas}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500 mb-1">Fecha programada</p>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      {new Date(mant.fecha_programada).toLocaleDateString('es-MX', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-lg font-bold text-emerald-700">${mant.costo.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Información sobre Mantenimientos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Preventivo</h4>
            </div>
            <p className="text-xs text-gray-600">
              Mantenimiento programado regularmente para prevenir fallas y mantener el vehículo en óptimas condiciones.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-gray-800">Correctivo</h4>
            </div>
            <p className="text-xs text-gray-600">
              Reparación de fallas detectadas durante la operación. Requiere atención para restaurar funcionalidad.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-gray-800">Emergencia</h4>
            </div>
            <p className="text-xs text-gray-600">
              Falla crítica que requiere atención inmediata. El vehículo puede estar fuera de servicio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
