import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, AlertTriangle, CheckCircle, Clock, Wrench, Car, XCircle, DollarSign } from 'lucide-react';


interface IncidentRegistration {
  fecha: string;
  hora: string;
  tipo: string;
  unidad: string;
  chofer: string;
  ruta: string;
  descripcion: string;
  costoEstimado: string;
  tiempoInactividad: string;
  requiereMantenimiento: boolean;
  ubicacion: string;
}

interface Incident {
  id: string;
  tipo: string;
  unidad: string;
  fecha: string;
  hora: string;
  estado_resolucion: string;
  costo_estimado: number;
}

const tipoIncidencias = [
  { value: 'ponchadura', label: 'Ponchadura', icon: AlertTriangle, color: 'amber' },
  { value: 'falla_mecanica', label: 'Falla Mecánica', icon: Wrench, color: 'red' },
  { value: 'retraso', label: 'Retraso', icon: Clock, color: 'blue' },
  { value: 'trafico', label: 'Tráfico', icon: Car, color: 'purple' },
  { value: 'accidente_menor', label: 'Accidente Menor', icon: XCircle, color: 'orange' },
];

export function OperatorIncidents() {
  const [showForm, setShowForm] = useState(false);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<IncidentRegistration>({
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
    tipo: '',
    unidad: '',
    chofer: '',
    ruta: '',
    descripcion: '',
    costoEstimado: '',
    tiempoInactividad: '',
    requiereMantenimiento: false,
    ubicacion: '',
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('incidencias')
        .select('*')
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading incidents:', error);
      } else {
        setRecentIncidents(data || []);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const incidentData = {
        fecha: formData.fecha,
        hora: formData.hora,
        tipo: formData.tipo,
        unidad: formData.unidad,
        chofer: formData.chofer || null,
        ruta: formData.ruta || null,
        descripcion: formData.descripcion,
        costo_estimado: formData.costoEstimado ? parseFloat(formData.costoEstimado) : 0,
        tiempo_inactividad: formData.tiempoInactividad || null,
        requiere_mantenimiento: formData.requiereMantenimiento,
        ubicacion: formData.ubicacion || null,
        estado_resolucion: 'pendiente',
      };

      const { error } = await supabase
        .from('incidencias')
        .insert([incidentData]);

      if (error) {
        console.error('Error saving incident:', error);
        alert('Error al guardar incidencia: ' + error.message);
        return;
      }

      alert('✓ Incidencia registrada correctamente\n\nLa información se ha capturado y estará disponible para el historial de mantenimiento y análisis de costos.');
      setShowForm(false);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        hora: '',
        tipo: '',
        unidad: '',
        chofer: '',
        ruta: '',
        descripcion: '',
        costoEstimado: '',
        tiempoInactividad: '',
        requiereMantenimiento: false,
        ubicacion: '',
      });
      loadIncidents();
    } catch (error) {
      console.error('Error saving incident:', error);
      alert('Error al guardar incidencia');
    }
  };

  const incidentsToday = recentIncidents.filter(inc => inc.fecha === new Date().toISOString().split('T')[0]).length;
  const totalCosto = recentIncidents.reduce((sum, inc) => sum + (inc.costo_estimado || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Registro de Incidencias</h1>
            <p className="text-amber-100 mt-1">Reporte de eventos y situaciones operativas</p>
            <p className="text-amber-200 text-sm mt-2">
              <Clock className="w-4 h-4 inline mr-1" />
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white hover:bg-amber-50 text-amber-700 px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Reporte</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Incidencias Hoy</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{incidentsToday}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Recientes</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{recentIncidents.length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Costo Acumulado</p>
              <p className="text-2xl font-bold text-red-700 mt-1">${totalCosto.toFixed(0)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Estado General</p>
              <p className="text-xl font-bold text-teal-700 mt-1">Estable</p>
            </div>
            <CheckCircle className="w-10 h-10 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow-md border border-emerald-100">
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <h2 className="text-lg font-semibold text-amber-800">Incidencias Recientes</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Cargando incidencias...
            </div>
          ) : recentIncidents.length > 0 ? (
            <div className="space-y-3">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Tipo</p>
                        <p className="font-semibold text-gray-800 capitalize">{incident.tipo.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Unidad</p>
                        <p className="font-medium text-gray-700">{incident.unidad}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fecha/Hora</p>
                        <p className="font-medium text-gray-700">{new Date(incident.fecha).toLocaleDateString('es-MX')} - {incident.hora}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Costo</p>
                        <p className="font-medium text-red-700">${incident.costo_estimado?.toFixed(0) || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                      incident.estado_resolucion === 'resuelto' ? 'bg-green-100 text-green-800' :
                      incident.estado_resolucion === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {incident.estado_resolucion === 'resuelto' ? 'Resuelto' :
                       incident.estado_resolucion === 'en_proceso' ? 'En Proceso' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="w-16 h-16 mx-auto mb-3 text-gray-400" />
              <p className="text-lg">No hay incidencias registradas</p>
              <p className="text-sm mt-1">Presiona "Nuevo Reporte" para registrar un evento</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white sticky top-0">
              <h2 className="text-2xl font-bold">Registrar Incidencia Operativa</h2>
              <p className="text-amber-100 text-sm mt-1">Reporte detallado de eventos durante la operación</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información del Evento */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-amber-200">
                  📅 Información del Evento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora del Incidente <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.hora}
                      onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                      placeholder="Ej: Av. Universidad km 3.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Incidencia */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-amber-200">
                  🚨 Tipo de Incidencia
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {tipoIncidencias.map((tipo) => {
                    const Icon = tipo.icon;
                    const isSelected = formData.tipo === tipo.value;
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo: tipo.value })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-amber-600' : 'text-gray-400'}`} />
                        <p className={`text-xs font-medium text-center ${isSelected ? 'text-amber-800' : 'text-gray-600'}`}>
                          {tipo.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Unidad y Personal */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-amber-200">
                  🚍 Unidad y Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad Afectada <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.unidad}
                      onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Unidad 01">Unidad 01 - Mercedes Sprinter 2022</option>
                      <option value="Unidad 02">Unidad 02 - Mercedes Sprinter 2022</option>
                      <option value="Unidad 03">Unidad 03 - Ford Transit 2021</option>
                      <option value="Unidad 04">Unidad 04 - Ford Transit 2021</option>
                      <option value="Unidad 05">Unidad 05 - Chevrolet Express 2020</option>
                      <option value="Unidad 06">Unidad 06 - Mercedes Sprinter 2023</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chofer a Cargo
                    </label>
                    <select
                      value={formData.chofer}
                      onChange={(e) => setFormData({ ...formData, chofer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Juan Pérez">Juan Pérez García</option>
                      <option value="María González">María González López</option>
                      <option value="Carlos Ramírez">Carlos Ramírez Silva</option>
                      <option value="Roberto Méndez">Roberto Méndez Cruz</option>
                      <option value="Ana Torres">Ana Torres Ramírez</option>
                      <option value="Diego Hernández">Diego Hernández Luna</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ruta en Ejecución
                    </label>
                    <select
                      value={formData.ruta}
                      onChange={(e) => setFormData({ ...formData, ruta: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Ruta Completa Matutina">Ruta Completa Matutina</option>
                      <option value="Ruta Completa Matutina 2">Ruta Completa Matutina 2</option>
                      <option value="Ruta Directa Universidad">Ruta Directa Universidad</option>
                      <option value="Ruta Directa CBTIS">Ruta Directa CBTIS</option>
                      <option value="Ruta Regreso Sendero">Ruta Regreso Sendero</option>
                      <option value="Ruta Vespertina TEC">Ruta Vespertina TEC</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Descripción del Incidente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-amber-200">
                  📝 Descripción del Incidente
                </h3>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                  rows={5}
                  placeholder="Describe detalladamente lo sucedido: ¿Qué ocurrió? ¿Cómo se manejó la situación? ¿Se requirió asistencia externa? ¿Hubo afectaciones a pasajeros?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Impacto Operativo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-amber-200">
                  ⏱️ Impacto Operativo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo de Inactividad <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tiempoInactividad}
                      onChange={(e) => setFormData({ ...formData, tiempoInactividad: e.target.value })}
                      required
                      placeholder="Ej: 25 minutos, 2 horas, 1 día"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tiempo que la unidad estuvo fuera de servicio</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo Estimado (MXN)
                    </label>
                    <input
                      type="number"
                      value={formData.costoEstimado}
                      onChange={(e) => setFormData({ ...formData, costoEstimado: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Costo de reparación o daños</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiereMantenimiento}
                      onChange={(e) => setFormData({ ...formData, requiereMantenimiento: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Requiere mantenimiento o seguimiento posterior
                    </span>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Importancia del Registro de Incidencias</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Esta información alimenta el historial de mantenimiento de cada unidad, permite calcular costos
                      operativos acumulados, identificar unidades con fallas recurrentes y planificar mantenimientos
                      preventivos. Un registro detallado mejora la confiabilidad del servicio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-lg transition-colors font-semibold shadow-md"
                >
                  Registrar Incidencia
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg transition-colors font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
