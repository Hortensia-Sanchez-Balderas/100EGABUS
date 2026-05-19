import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Bus, CheckCircle, Wrench, AlertCircle, Fuel } from 'lucide-react';


interface Unit {
  id: string;
  numero: string;
  modelo: string;
  capacidad: number;
  rendimiento: number;
  estado: 'activa' | 'mantenimiento' | 'fuera_servicio';
  kilometraje: number;
}

export function OperatorUnits() {
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
      } else {
        setUnits(data || []);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'mantenimiento':
        return <Wrench className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'mantenimiento':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'Activa';
      case 'mantenimiento':
        return 'Mantenimiento';
      default:
        return estado;
    }
  };

  const activeUnits = units.filter((u) => u.estado === 'activa').length;
  const maintenanceUnits = units.filter((u) => u.estado === 'mantenimiento').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-800">Consulta de Unidades</h1>
        <p className="text-gray-600 mt-1">Estado y disponibilidad de vehículos</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Unidades</p>
              <p className="text-3xl font-bold mt-1">{units.length}</p>
            </div>
            <Bus className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Disponibles</p>
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
      </div>

      {/* Units Grid */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Cargando unidades...
        </div>
      ) : units.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          No hay unidades registradas
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <div key={unit.id} className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden">
              <div
                className={`p-4 ${
                  unit.estado === 'activa'
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
              >
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <Bus className="w-8 h-8" />
                    <div>
                      <h3 className="font-bold text-lg">{unit.numero}</h3>
                      <p className="text-sm opacity-90">{unit.modelo}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Capacidad</p>
                    <p className="text-sm font-semibold text-gray-800">{unit.capacidad} pasajeros</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rendimiento</p>
                    <div className="flex items-center space-x-1">
                      <Fuel className="w-3 h-3 text-emerald-600" />
                      <p className="text-sm font-semibold text-gray-800">{unit.rendimiento} km/l</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-100">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.estado)}`}>
                      {getStatusIcon(unit.estado)}
                      <span>{getStatusLabel(unit.estado)}</span>
                    </span>
                    <span className="text-xs text-gray-500">{unit.kilometraje?.toLocaleString() || 0} km</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
