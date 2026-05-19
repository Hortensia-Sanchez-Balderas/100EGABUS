import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Clock, CheckCircle, Calendar, AlertCircle, Users, Fuel } from 'lucide-react';


interface TripRegistration {
  fecha: string;
  horaSalidaReal: string;
  horaLlegadaReal: string;
  horaSalidaProgramada: string;
  horaLlegadaProgramada: string;
  ruta: string;
  unidad: string;
  chofer: string;
  pasajeros: string;
  gasolinaCargada: string;
  gasolinaConsumida: string;
  observaciones: string;
}

interface Trip {
  id: string;
  fecha: string;
  ruta: string;
  unidad: string;
  pasajeros: number;
  hora_salida_real: string;
  hora_llegada_real: string;
  retraso: number;
  gasolina_consumida: number;
}

export function OperatorTrips() {
  const [showForm, setShowForm] = useState(false);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<TripRegistration>({
    fecha: new Date().toISOString().split('T')[0],
    horaSalidaReal: '',
    horaLlegadaReal: '',
    horaSalidaProgramada: '',
    horaLlegadaProgramada: '',
    ruta: '',
    unidad: '',
    chofer: '',
    pasajeros: '',
    gasolinaCargada: '',
    gasolinaConsumida: '',
    observaciones: '',
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('fecha', today)
        .order('hora_salida_real', { ascending: false });

      if (error) {
        console.error('Error loading trips:', error);
      } else {
        setRecentTrips(data || []);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tripData = {
        fecha: formData.fecha,
        hora_salida_real: formData.horaSalidaReal,
        hora_llegada_real: formData.horaLlegadaReal,
        hora_salida_programada: formData.horaSalidaProgramada || null,
        hora_llegada_programada: formData.horaLlegadaProgramada || null,
        ruta: formData.ruta,
        unidad: formData.unidad,
        chofer: formData.chofer,
        pasajeros: parseInt(formData.pasajeros),
        gasolina_cargada: formData.gasolinaCargada ? parseFloat(formData.gasolinaCargada) : null,
        gasolina_consumida: parseFloat(formData.gasolinaConsumida),
        observaciones: formData.observaciones || null,
      };

      const { error } = await supabase
        .from('viajes')
        .insert([tripData]);

      if (error) {
        console.error('Error saving trip:', error);
        alert('Error al guardar viaje: ' + error.message);
        return;
      }

      alert('✓ Viaje registrado correctamente\n\nLa información ha sido capturada en el sistema y estará disponible para análisis.');
      setShowForm(false);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        horaSalidaReal: '',
        horaLlegadaReal: '',
        horaSalidaProgramada: '',
        horaLlegadaProgramada: '',
        ruta: '',
        unidad: '',
        chofer: '',
        pasajeros: '',
        gasolinaCargada: '',
        gasolinaConsumida: '',
        observaciones: '',
      });
      loadTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Error al guardar viaje');
    }
  };

  const totalPasajeros = recentTrips.reduce((sum, trip) => sum + trip.pasajeros, 0);
  const totalGasolina = recentTrips.reduce((sum, trip) => sum + (trip.gasolina_consumida || 0), 0);
  const viajesConRetraso = recentTrips.filter(t => t.retraso > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Registro de Viajes</h1>
            <p className="text-emerald-100 mt-1">Captura de información operativa diaria</p>
            <p className="text-emerald-200 text-sm mt-2">
              <Clock className="w-4 h-4 inline mr-1" />
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white hover:bg-emerald-50 text-emerald-700 px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Viajes Registrados</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{recentTrips.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pasajeros</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{totalPasajeros}</p>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Combustible Total</p>
              <p className="text-3xl font-bold text-teal-700 mt-1">{totalGasolina.toFixed(1)}L</p>
            </div>
            <Fuel className="w-10 h-10 text-teal-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Con Retraso</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{viajesConRetraso}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white rounded-lg shadow-md border border-emerald-100">
        <div className="bg-emerald-50 border-b border-emerald-200 p-4">
          <h2 className="text-lg font-semibold text-emerald-800">Viajes Registrados Hoy</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Cargando viajes...
            </div>
          ) : recentTrips.length > 0 ? (
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Ruta</p>
                      <p className="font-semibold text-gray-800">{trip.ruta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Unidad</p>
                      <p className="font-medium text-gray-700">{trip.unidad}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pasajeros</p>
                      <p className="font-medium text-emerald-700">{trip.pasajeros} estudiantes</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Combustible</p>
                      <p className="font-medium text-teal-700">{trip.gasolina_consumida?.toFixed(1) || 0} L</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-emerald-700">{trip.hora_salida_real}</p>
                    <p className="text-xs text-gray-500">{new Date(trip.fecha).toLocaleDateString('es-MX')}</p>
                    {trip.retraso > 0 && (
                      <span className="inline-block mt-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                        +{trip.retraso} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-3 text-gray-400" />
              <p className="text-lg">No hay viajes registrados hoy</p>
              <p className="text-sm mt-1">Presiona "Nuevo Registro" para capturar información</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white sticky top-0">
              <h2 className="text-2xl font-bold">Registrar Viaje Realizado</h2>
              <p className="text-emerald-100 text-sm mt-1">Captura toda la información operativa del recorrido</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información General */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-emerald-200">
                  📅 Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha del Viaje <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ruta Ejecutada <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.ruta}
                      onChange={(e) => setFormData({ ...formData, ruta: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Seleccionar ruta...</option>
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

              {/* Operación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-emerald-200">
                  🚍 Operación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad Utilizada <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.unidad}
                      onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Seleccionar unidad...</option>
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
                      Chofer Asignado <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.chofer}
                      onChange={(e) => setFormData({ ...formData, chofer: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Seleccionar chofer...</option>
                      <option value="Juan Pérez">Juan Pérez García</option>
                      <option value="María González">María González López</option>
                      <option value="Carlos Ramírez">Carlos Ramírez Silva</option>
                      <option value="Roberto Méndez">Roberto Méndez Cruz</option>
                      <option value="Ana Torres">Ana Torres Ramírez</option>
                      <option value="Diego Hernández">Diego Hernández Luna</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Horarios */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-emerald-200">
                  🕐 Horarios (Real vs Programado)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-800 mb-3">Horarios Programados</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Salida Programada</label>
                        <input
                          type="time"
                          value={formData.horaSalidaProgramada}
                          onChange={(e) => setFormData({ ...formData, horaSalidaProgramada: e.target.value })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Llegada Programada</label>
                        <input
                          type="time"
                          value={formData.horaLlegadaProgramada}
                          onChange={(e) => setFormData({ ...formData, horaLlegadaProgramada: e.target.value })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-800 mb-3">Horarios Reales <span className="text-red-600">*</span></p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Salida Real</label>
                        <input
                          type="time"
                          value={formData.horaSalidaReal}
                          onChange={(e) => setFormData({ ...formData, horaSalidaReal: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Llegada Real</label>
                        <input
                          type="time"
                          value={formData.horaLlegadaReal}
                          onChange={(e) => setFormData({ ...formData, horaLlegadaReal: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pasajeros y Combustible */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-emerald-200">
                  👥 Pasajeros y ⛽ Combustible
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad de Pasajeros <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.pasajeros}
                      onChange={(e) => setFormData({ ...formData, pasajeros: e.target.value })}
                      required
                      min="0"
                      placeholder="Ej: 42"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Número de estudiantes transportados</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gasolina Cargada (L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.gasolinaCargada}
                      onChange={(e) => setFormData({ ...formData, gasolinaCargada: e.target.value })}
                      min="0"
                      placeholder="Ej: 45.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Litros cargados antes del viaje</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gasolina Consumida (L) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.gasolinaConsumida}
                      onChange={(e) => setFormData({ ...formData, gasolinaConsumida: e.target.value })}
                      required
                      min="0"
                      placeholder="Ej: 5.3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Consumo estimado del recorrido</p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-emerald-200">
                  📝 Observaciones
                </h3>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={4}
                  placeholder="Registra cualquier situación relevante del viaje: condiciones del tráfico, clima, eventos especiales, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Info Box */}
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
                <div className="flex">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Importancia del Registro</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      Esta información alimenta el sistema para generar métricas de ocupación, eficiencia de rutas,
                      costos operativos y detectar necesidades de optimización. Los datos capturados son fundamentales
                      para la toma de decisiones administrativas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 rounded-lg transition-colors font-semibold shadow-md"
                >
                  Registrar Viaje
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
