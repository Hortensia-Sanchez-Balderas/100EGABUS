import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bus, Wrench, CheckCircle, XCircle, AlertTriangle, Fuel, Gauge } from 'lucide-react';


interface Unit {
  id: string;
  numero: string;
  modelo: string;
  capacidad: number;
  rendimiento: number;
  estado: 'activa' | 'mantenimiento' | 'fuera_servicio';
  kilometraje: number;
  ultimo_mantenimiento: string | null;
  proximo_mantenimiento: string | null;
}

export function Units() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .order('numero', { ascending: true });

      if (error) {
        console.error('Error loading units:', error);
        alert('Error al cargar unidades: ' + error.message);
      } else {
        setUnits(data || []);
      }
    } catch (error) {
      console.error('Error loading units:', error);
      alert('Error al cargar unidades');
    } finally {
      setLoading(false);
    }
  };

  const activeUnits = units.filter(u => u.estado === 'activa').length;
  const maintenanceUnits = units.filter(u => u.estado === 'mantenimiento').length;
  const outOfServiceUnits = units.filter(u => u.estado === 'fuera_servicio').length;
  const totalCapacity = units.reduce((sum, u) => sum + u.capacidad, 0);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'text-green-600 bg-green-100';
      case 'mantenimiento': return 'text-amber-600 bg-amber-100';
      case 'fuera_servicio': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activa': return <CheckCircle className="w-5 h-5" />;
      case 'mantenimiento': return <Wrench className="w-5 h-5" />;
      case 'fuera_servicio': return <XCircle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'activa': return 'Activa';
      case 'mantenimiento': return 'Mantenimiento';
      case 'fuera_servicio': return 'Fuera de Servicio';
      default: return estado;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Gestión de Unidades</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Unidades Totales</p>
              <p className="text-3xl font-bold mt-1">{units.length}</p>
            </div>
            <Bus className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Unidades Activas</p>
              <p className="text-3xl font-bold mt-1">{activeUnits}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">En Mantenimiento</p>
              <p className="text-3xl font-bold mt-1">{maintenanceUnits}</p>
            </div>
            <Wrench className="w-10 h-10 text-amber-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Capacidad Total</p>
              <p className="text-3xl font-bold mt-1">{totalCapacity}</p>
            </div>
            <Bus className="w-10 h-10 text-teal-200" />
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50 border-b border-emerald-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Unidad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Modelo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Capacidad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Rendimiento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Kilometraje</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Mantenimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {loading && units.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Cargando unidades...
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay unidades registradas
                  </td>
                </tr>
              ) : (
                units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Bus className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-gray-800">{unit.numero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{unit.modelo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{unit.capacidad} pasajeros</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Fuel className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">{unit.rendimiento} km/l</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Gauge className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">{unit.kilometraje?.toLocaleString() || 0} km</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.estado)}`}>
                        {getStatusIcon(unit.estado)}
                        <span>{getStatusLabel(unit.estado)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {unit.ultimo_mantenimiento ? (
                        <>
                          <div>Último: {new Date(unit.ultimo_mantenimiento).toLocaleDateString('es-MX')}</div>
                          {unit.proximo_mantenimiento && (
                            <div>Próximo: {new Date(unit.proximo_mantenimiento).toLocaleDateString('es-MX')}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden">
            <div className={`p-4 ${unit.estado === 'activa' ? 'bg-gradient-to-r from-green-500 to-green-600' : unit.estado === 'mantenimiento' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <Bus className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-xl">{unit.numero}</h3>
                    <p className="text-sm opacity-90">{unit.modelo}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${unit.estado === 'activa' ? 'bg-green-100 text-green-800' : unit.estado === 'mantenimiento' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                  {getStatusLabel(unit.estado)}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Capacidad</p>
                  <p className="font-semibold text-gray-800">{unit.capacidad} pasajeros</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rendimiento</p>
                  <p className="font-semibold text-gray-800">{unit.rendimiento} km/l</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kilometraje</p>
                  <p className="font-semibold text-gray-800">{unit.kilometraje?.toLocaleString() || 0} km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className="font-semibold text-gray-800">{getStatusLabel(unit.estado)}</p>
                </div>
              </div>

              {unit.ultimo_mantenimiento && (
                <div className="pt-4 border-t border-emerald-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Mantenimiento</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Último:</span>
                      <span className="font-medium text-gray-800">{new Date(unit.ultimo_mantenimiento).toLocaleDateString('es-MX')}</span>
                    </div>
                    {unit.proximo_mantenimiento && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Próximo:</span>
                        <span className="font-medium text-emerald-700">{new Date(unit.proximo_mantenimiento).toLocaleDateString('es-MX')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
