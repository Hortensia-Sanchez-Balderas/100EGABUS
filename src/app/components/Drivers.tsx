import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Bus, Clock, TrendingUp, CheckCircle } from 'lucide-react';


interface Driver {
  id: string;
  nombre: string;
  unidad_asignada: string;
  turno: 'matutino' | 'vespertino' | 'mixto';
  vueltas_por_dia: number;
  estado: 'activo' | 'descanso' | 'incapacidad';
  hora_entrada: string;
  hora_salida: string;
  experiencia: string;
  licencia: string;
  telefono?: string;
}

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('choferes')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error loading drivers:', error);
        alert('Error al cargar choferes: ' + error.message);
      } else {
        setDrivers(data || []);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      alert('Error al cargar choferes');
    } finally {
      setLoading(false);
    }
  };

  const activeDrivers = drivers.filter(d => d.estado === 'activo').length;
  const totalTripsPerDay = drivers.reduce((sum, d) => sum + d.vueltas_por_dia, 0);
  const avgTripsPerDriver = drivers.length > 0 ? totalTripsPerDay / drivers.length : 0;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'descanso': return 'bg-blue-100 text-blue-800';
      case 'incapacidad': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTurnoColor = (turno: string) => {
    switch (turno) {
      case 'matutino': return 'bg-amber-100 text-amber-800';
      case 'vespertino': return 'bg-purple-100 text-purple-800';
      case 'mixto': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Gestión de Choferes</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Choferes</p>
              <p className="text-3xl font-bold mt-1">{drivers.length}</p>
            </div>
            <User className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Choferes Activos</p>
              <p className="text-3xl font-bold mt-1">{activeDrivers}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Vueltas Totales/Día</p>
              <p className="text-3xl font-bold mt-1">{totalTripsPerDay}</p>
            </div>
            <Bus className="w-10 h-10 text-teal-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-lime-600 to-lime-700 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lime-100 text-sm">Promedio Vueltas</p>
              <p className="text-3xl font-bold mt-1">{avgTripsPerDriver.toFixed(1)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-lime-200" />
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50 border-b border-emerald-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Chofer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Unidad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Turno</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Vueltas/Día</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Horario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {loading && drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Cargando choferes...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay choferes registrados
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{driver.nombre}</p>
                          <p className="text-xs text-gray-500">{driver.experiencia} de experiencia</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Bus className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">{driver.unidad_asignada || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTurnoColor(driver.turno)}`}>
                        {driver.turno.charAt(0).toUpperCase() + driver.turno.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{driver.vueltas_por_dia}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{driver.hora_entrada} - {driver.hora_salida}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.estado)}`}>
                        {driver.estado.charAt(0).toUpperCase() + driver.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Distribución de Carga Laboral</h2>
          <div className="space-y-3">
            {drivers.map((driver) => (
              <div key={driver.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{driver.nombre.split(' ')[0]}</span>
                  <span className="text-sm font-bold text-emerald-700">{driver.vueltas_por_dia} vueltas</span>
                </div>
                <div className="w-full bg-emerald-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${(driver.vueltas_por_dia / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Tabla de Horarios</h2>
          <div className="space-y-3">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{driver.nombre.split(' ').slice(0, 2).join(' ')}</p>
                    <p className="text-xs text-gray-500">{driver.unidad_asignada || '-'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm font-medium text-emerald-700">
                    <Clock className="w-4 h-4" />
                    <span>{driver.hora_entrada}</span>
                  </div>
                  <p className="text-xs text-gray-500">{driver.turno}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
