import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Plus, Edit2, Trash2, Users, Clock } from 'lucide-react';


interface Stop {
  id: string;
  nombre: string;
  ubicacion: string;
  coordenadas: string;
  ruta: string;
  capacidad: number;
  estado: 'activa' | 'inactiva';
  usuarios_activos?: number;
}

export function Stops() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    coordenadas: '',
    ruta: '',
    capacidad: '',
  });

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    setLoading(true);
    try {
      const { data: paradasData, error: paradasError } = await supabase
        .from('paradas')
        .select('*')
        .order('nombre', { ascending: true });

      if (paradasError) {
        console.error('Error loading stops:', paradasError);
        alert('Error al cargar paradas: ' + paradasError.message);
      } else {
        const { data: estudiantesData } = await supabase
          .from('estudiantes')
          .select('parada_asignada')
          .eq('estado', 'activo');

        const stopsWithUsers = (paradasData || []).map(parada => {
          const usuariosActivos = (estudiantesData || []).filter(
            est => est.parada_asignada === parada.nombre
          ).length;
          return { ...parada, usuarios_activos: usuariosActivos };
        });

        setStops(stopsWithUsers);
      }
    } catch (error) {
      console.error('Error loading stops:', error);
      alert('Error al cargar paradas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = () => {
    setEditingStop(null);
    setFormData({ nombre: '', ubicacion: '', coordenadas: '', ruta: '', capacidad: '' });
    setShowModal(true);
  };

  const handleEditStop = (stop: Stop) => {
    setEditingStop(stop);
    setFormData({
      nombre: stop.nombre,
      ubicacion: stop.ubicacion,
      coordenadas: stop.coordenadas,
      ruta: stop.ruta,
      capacidad: stop.capacidad.toString(),
    });
    setShowModal(true);
  };

  const handleSaveStop = async () => {
    try {
      const stopData = {
        nombre: formData.nombre,
        ubicacion: formData.ubicacion,
        coordenadas: formData.coordenadas,
        ruta: formData.ruta,
        capacidad: parseInt(formData.capacidad),
      };

      if (editingStop) {
        const { error } = await supabase
          .from('paradas')
          .update(stopData)
          .eq('id', editingStop.id);

        if (error) {
          console.error('Error updating stop:', error);
          alert('Error al actualizar parada: ' + error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('paradas')
          .insert([{ ...stopData, estado: 'activa' }]);

        if (error) {
          console.error('Error creating stop:', error);
          alert('Error al crear parada: ' + error.message);
          return;
        }
      }

      setShowModal(false);
      loadStops();
    } catch (error) {
      console.error('Error saving stop:', error);
      alert('Error al guardar parada');
    }
  };

  const handleDeleteStop = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta parada?')) {
      try {
        const { error } = await supabase
          .from('paradas')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting stop:', error);
          alert('Error al eliminar parada: ' + error.message);
          return;
        }

        loadStops();
      } catch (error) {
        console.error('Error deleting stop:', error);
        alert('Error al eliminar parada');
      }
    }
  };

  const totalCapacity = stops.reduce((sum, stop) => sum + stop.capacidad, 0);
  const totalUsers = stops.reduce((sum, stop) => sum + (stop.usuarios_activos || 0), 0);
  const avgOccupancy = totalCapacity > 0 ? (totalUsers / totalCapacity * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Gestión de Paradas</h1>
        <button
          onClick={handleAddStop}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Parada</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Paradas</p>
              <p className="text-3xl font-bold mt-1">{stops.length}</p>
            </div>
            <MapPin className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Capacidad Total</p>
              <p className="text-3xl font-bold mt-1">{totalCapacity}</p>
            </div>
            <Users className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Usuarios Totales</p>
              <p className="text-3xl font-bold mt-1">{totalUsers}</p>
            </div>
            <Users className="w-10 h-10 text-teal-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-lime-600 to-lime-700 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lime-100 text-sm">Ocupación Promedio</p>
              <p className="text-3xl font-bold mt-1">{avgOccupancy.toFixed(0)}%</p>
            </div>
            <Clock className="w-10 h-10 text-lime-200" />
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4">Mapa de Paradas</h2>
        <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-8 h-96 border-2 border-emerald-200">
          {/* Simulated Map */}
          <div className="absolute inset-0 p-8">
            {stops.map((stop, index) => {
              const positions = [
                { top: '20%', left: '30%' },
                { top: '40%', left: '70%' },
                { top: '35%', left: '45%' },
                { top: '60%', left: '25%' },
                { top: '70%', left: '60%' },
                { top: '50%', left: '80%' },
              ];
              const pos = positions[index] || { top: '50%', left: '50%' };
              const occupancy = ((stop.usuarios_activos || 0) / stop.capacidad) * 100;
              const getMarkerColor = () => {
                if (occupancy >= 80) return 'bg-red-500';
                if (occupancy >= 50) return 'bg-amber-500';
                return 'bg-green-500';
              };

              return (
                <div
                  key={stop.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <div className={`w-4 h-4 rounded-full ${getMarkerColor()} border-2 border-white shadow-lg animate-pulse`}></div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap shadow-xl">
                      <p className="font-semibold">{stop.nombre}</p>
                      <p>{stop.usuarios_activos || 0}/{stop.capacidad} usuarios</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg border border-emerald-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Nivel de Saturación</p>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">&lt; 50%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs text-gray-600">50-80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">&gt; 80%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stops Grid */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Cargando paradas...
        </div>
      ) : stops.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          No hay paradas registradas
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stops.map((stop) => (
          <div key={stop.id} className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <MapPin className="w-6 h-6" />
                  <h3 className="text-xl font-bold">{stop.nombre}</h3>
                </div>
                <span className="bg-white text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                  {stop.ruta}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                <p className="text-gray-800 font-medium">{stop.ubicacion}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Coordenadas</p>
                <p className="text-gray-800 font-mono text-sm">{stop.coordenadas}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-emerald-700">{stop.usuarios_activos || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Capacidad</p>
                  <p className="text-2xl font-bold text-emerald-700">{stop.capacidad}</p>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-emerald-700">Ocupación</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {(((stop.usuarios_activos || 0) / stop.capacidad) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${((stop.usuarios_activos || 0) / stop.capacidad) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleEditStop(stop)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center space-x-1 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteStop(stop.id)}
                  className="px-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-emerald-800 mb-6">
              {editingStop ? 'Editar Parada' : 'Nueva Parada'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Parada</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas</label>
                <input
                  type="text"
                  placeholder="25.8756, -100.3456"
                  value={formData.coordenadas}
                  onChange={(e) => setFormData({ ...formData, coordenadas: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ruta</label>
                <select
                  value={formData.ruta}
                  onChange={(e) => setFormData({ ...formData, ruta: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Ruta 1">Ruta 1</option>
                  <option value="Ruta 2">Ruta 2</option>
                  <option value="Ruta 3">Ruta 3</option>
                  <option value="Ruta 4">Ruta 4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                <input
                  type="number"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveStop}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
