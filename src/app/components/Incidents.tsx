import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Wrench, Clock, Car, AlertCircle, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface Incident {
  id: string;
  fecha: string;
  hora: string;
  tipo: 'ponchadura' | 'falla_mecanica' | 'retraso' | 'trafico' | 'accidente_menor';
  unidad: string;
  chofer: string | null;
  ruta: string | null;
  descripcion: string;
  costo_estimado: number;
  estado_resolucion: 'pendiente' | 'en_proceso' | 'resuelto';
  tiempo_inactividad: string | null;
  requiere_mantenimiento: boolean;
  ubicacion: string | null;
}

export function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('todas');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('incidencias')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error loading incidents:', error);
        alert('Error al cargar incidencias: ' + error.message);
      } else {
        setIncidents(data || []);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
      alert('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = filterType === 'todas'
    ? incidents
    : incidents.filter(inc => inc.tipo === filterType);

  const totalCost = incidents.reduce((sum, inc) => sum + (inc.costo_estimado || 0), 0);
  const pendingIncidents = incidents.filter(inc => inc.estado_resolucion === 'pendiente').length;
  const resolvedIncidents = incidents.filter(inc => inc.estado_resolucion === 'resuelto').length;
  const highPriority = incidents.length; // Todos son potencialmente de alta prioridad
  const processingIncidents = incidents.filter(inc => inc.estado_resolucion === 'en_proceso').length;

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'ponchadura': return <AlertTriangle className="w-5 h-5" />;
      case 'falla_mecanica': return <Wrench className="w-5 h-5" />;
      case 'retraso': return <Clock className="w-5 h-5" />;
      case 'trafico': return <Car className="w-5 h-5" />;
      case 'accidente_menor': return <AlertCircle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'ponchadura': return 'Ponchadura';
      case 'falla_mecanica': return 'Falla Mecánica';
      case 'retraso': return 'Retraso';
      case 'trafico': return 'Tráfico';
      case 'accidente_menor': return 'Accidente Menor';
      default: return tipo;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'ponchadura': return 'bg-amber-100 text-amber-800';
      case 'falla_mecanica': return 'bg-red-100 text-red-800';
      case 'retraso': return 'bg-blue-100 text-blue-800';
      case 'trafico': return 'bg-purple-100 text-purple-800';
      case 'accidente_menor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'resuelto': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'en_proceso': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pendiente': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'resuelto': return 'bg-green-100 text-green-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'resuelto': return 'Resuelto';
      case 'en_proceso': return 'En Proceso';
      case 'pendiente': return 'Pendiente';
      default: return estado;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Gestión de Incidencias</h1>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="todas">Todas las incidencias</option>
          <option value="ponchadura">Ponchaduras</option>
          <option value="falla_mecanica">Fallas Mecánicas</option>
          <option value="retraso">Retrasos</option>
          <option value="trafico">Tráfico</option>
          <option value="accidente_menor">Accidentes Menores</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Incidencias</p>
              <p className="text-3xl font-bold mt-1">{incidents.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Pendientes</p>
              <p className="text-3xl font-bold mt-1">{pendingIncidents}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">En Proceso</p>
              <p className="text-3xl font-bold mt-1">{processingIncidents}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Costo Total</p>
              <p className="text-3xl font-bold mt-1">${totalCost.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-800 mb-6">Timeline de Incidentes</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando incidencias...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay incidencias registradas</div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((incident, index) => (
              <div key={incident.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${getTypeColor(incident.tipo)} flex items-center justify-center`}>
                    {getTypeIcon(incident.tipo)}
                  </div>
                  {index < filteredIncidents.length - 1 && (
                    <div className="w-0.5 h-16 bg-emerald-200"></div>
                  )}
                </div>
                <div className="flex-1 bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{getTypeLabel(incident.tipo)}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.estado_resolucion)}`}>
                          {getStatusLabel(incident.estado_resolucion)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{incident.descripcion}</p>
                    </div>
                    {getStatusIcon(incident.estado_resolucion)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Fecha</p>
                      <p className="font-medium text-gray-800">{new Date(incident.fecha).toLocaleDateString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Hora</p>
                      <p className="font-medium text-gray-800">{incident.hora}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Unidad</p>
                      <p className="font-medium text-gray-800">{incident.unidad}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Inactividad</p>
                      <p className="font-medium text-gray-800">{incident.tiempo_inactividad || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Costo</p>
                      <p className="font-medium text-emerald-700">${incident.costo_estimado?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Estadísticas por Tipo</h2>
          <div className="space-y-3">
            {['ponchadura', 'falla_mecanica', 'retraso', 'trafico', 'accidente_menor'].map((tipo) => {
              const count = incidents.filter(inc => inc.tipo === tipo).length;
              const percentage = incidents.length > 0 ? (count / incidents.length) * 100 : 0;
              return (
                <div key={tipo}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getTypeColor(tipo)}`}>
                        {getTypeIcon(tipo)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{getTypeLabel(tipo)}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">{count}</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Maintenance Costs */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Costos de Mantenimiento</h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-sm text-gray-600 mb-1">Costo Total Acumulado</p>
              <p className="text-3xl font-bold text-emerald-700">${totalCost.toLocaleString()} MXN</p>
            </div>

            <div className="space-y-2">
              {incidents
                .filter(inc => (inc.costo_estimado || 0) > 0)
                .sort((a, b) => (b.costo_estimado || 0) - (a.costo_estimado || 0))
                .slice(0, 5)
                .map((incident) => (
                  <div key={incident.id} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{incident.unidad}</p>
                      <p className="text-xs text-gray-500">{getTypeLabel(incident.tipo)}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">${(incident.costo_estimado || 0).toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
