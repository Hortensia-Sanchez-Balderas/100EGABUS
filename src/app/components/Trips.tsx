import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, Bus, User, MapPin, Fuel, TrendingUp, AlertCircle } from 'lucide-react';

interface Trip {
  id: string;
  fecha: string;
  hora_salida_real: string;
  hora_llegada_real: string;
  unidad: string;
  ruta: string;
  chofer: string;
  pasajeros: number;
  gasolina_consumida: number;
  tiempo_recorrido: number;
  retraso: number;
}

export function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadTrips();
  }, [filterDate]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('fecha', filterDate)
        .order('hora_salida_real', { ascending: true });

      if (error) {
        console.error('Error loading trips:', error);
        alert('Error al cargar viajes: ' + error.message);
      } else {
        setTrips(data || []);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      alert('Error al cargar viajes');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips;
  const completedTrips = trips.length;
  const delayedTrips = trips.filter(t => (t.retraso || 0) > 15).length;
  const onTimeTrips = trips.filter(t => (t.retraso || 0) <= 15).length;
  const totalPassengers = trips.reduce((sum, t) => sum + (t.pasajeros || 0), 0);
  const totalFuel = trips.reduce((sum, t) => sum + (t.gasolina_consumida || 0), 0);
  
  // Calculate performance metrics
  const onTimePerformance = completedTrips > 0 ? Math.round((onTimeTrips / completedTrips) * 100) : 0;
  const avgDelay = completedTrips > 0 
    ? Math.round(trips.reduce((sum, t) => sum + (t.retraso || 0), 0) / completedTrips)
    : 0;
  
  const avgPassengersPerTrip = completedTrips > 0 ? Math.round(totalPassengers / completedTrips) : 0;
  
  // Calculate median delay
  const delays = trips.map(t => t.retraso || 0).sort((a, b) => a - b);
  const medianDelay = delays.length > 0
    ? delays.length % 2 === 0
      ? (delays[delays.length / 2 - 1] + delays[delays.length / 2]) / 2
      : delays[Math.floor(delays.length / 2)]
    : 0;
  
  // Calculate fuel efficiency (L per trip)
  const fuelEfficiency = completedTrips > 0 ? (totalFuel / completedTrips).toFixed(1) : '0.0';
  
  // Calculate cost per passenger (estimated: 25 MXN per liter fuel)
  const fuelCost = totalFuel * 25;
  const costPerPassenger = totalPassengers > 0 ? (fuelCost / totalPassengers).toFixed(2) : '0.00';

  const getStatusColor = (retraso: number) => {
    if (retraso > 15) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusLabel = (retraso: number) => {
    if (retraso > 15) return 'Retrasado';
    return 'A Tiempo';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Registro de Viajes</h1>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Filtrar por fecha:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Viajes del Día</p>
              <p className="text-3xl font-bold mt-1">{filteredTrips.length}</p>
            </div>
            <Bus className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">A Tiempo</p>
              <p className="text-3xl font-bold mt-1">{trips.filter(t => (t.retraso || 0) <= 15).length}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Con Retraso</p>
              <p className="text-3xl font-bold mt-1">{delayedTrips}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-amber-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Total Pasajeros</p>
              <p className="text-3xl font-bold mt-1">{totalPassengers}</p>
            </div>
            <User className="w-10 h-10 text-teal-200" />
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50 border-b border-emerald-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Horario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Unidad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Ruta</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Chofer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Pasajeros</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Gasolina</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Tiempo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Retraso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Cargando viajes...
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No hay viajes registrados para esta fecha
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-800">{new Date(trip.fecha).toLocaleDateString('es-MX')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div>{trip.hora_salida_real} - {trip.hora_llegada_real}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Bus className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">{trip.unidad}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">{trip.ruta}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{trip.chofer}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{trip.pasajeros}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Fuel className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">{trip.gasolina_consumida?.toFixed(1) || 0} L</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{trip.tiempo_recorrido || 0} min</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.retraso || 0)}`}>
                        {trip.retraso > 0 ? `+${trip.retraso} min` : 'A Tiempo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Comparación Tiempo Estimado vs Real</h2>
          <div className="space-y-4">
            {filteredTrips.map((trip) => {
              const estimado = parseInt(trip.tiempoEstimado);
              const real = parseInt(trip.tiempoRecorrido);
              const diferencia = real - estimado;
              const porcentaje = (real / estimado) * 100;

              return (
                <div key={trip.id} className="border-b border-emerald-100 pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{trip.ruta}</span>
                    <span className={`text-sm font-bold ${diferencia > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {diferencia > 0 ? `+${diferencia}` : diferencia} min
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-emerald-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${diferencia > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-16">{trip.tiempoRecorrido}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Resumen del Día</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bus className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Viajes</p>
                  <p className="text-2xl font-bold text-emerald-700">{filteredTrips.length}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Pasajeros Totales</p>
                  <p className="text-2xl font-bold text-green-700">{totalPassengers}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Fuel className="w-8 h-8 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-600">Gasolina Consumida</p>
                  <p className="text-2xl font-bold text-teal-700">{totalFuel.toFixed(1)} L</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-600">Promedio de Retraso</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {delayedTrips > 0 ? `${(delayedTrips / filteredTrips.length * 100).toFixed(0)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
