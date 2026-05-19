import { useState } from 'react';
import { Calendar, Clock, Bus, User, MapPin, Fuel, TrendingUp, AlertCircle } from 'lucide-react';

interface Trip {
  id: string;
  fecha: string;
  horaSalida: string;
  horaLlegada: string;
  unidad: string;
  ruta: string;
  chofer: string;
  pasajeros: number;
  gasolinaConsumida: number;
  tiempoRecorrido: string;
  tiempoEstimado: string;
  estado: 'completado' | 'retrasado' | 'en_curso';
}

const trips: Trip[] = [
  {
    id: '1',
    fecha: '2026-05-16',
    horaSalida: '5:00 AM',
    horaLlegada: '6:25 AM',
    unidad: 'Unidad 01',
    ruta: 'Ruta Completa Matutina',
    chofer: 'Juan Pérez',
    pasajeros: 42,
    gasolinaConsumida: 5.3,
    tiempoRecorrido: '85 min',
    tiempoEstimado: '85 min',
    estado: 'completado'
  },
  {
    id: '2',
    fecha: '2026-05-16',
    horaSalida: '5:30 AM',
    horaLlegada: '7:10 AM',
    unidad: 'Unidad 02',
    ruta: 'Ruta Completa Matutina 2',
    chofer: 'María González',
    pasajeros: 38,
    gasolinaConsumida: 5.8,
    tiempoRecorrido: '100 min',
    tiempoEstimado: '90 min',
    estado: 'retrasado'
  },
  {
    id: '3',
    fecha: '2026-05-16',
    horaSalida: '13:00 PM',
    horaLlegada: '13:45 PM',
    unidad: 'Unidad 03',
    ruta: 'Ruta Directa Universidad',
    chofer: 'Carlos Ramírez',
    pasajeros: 35,
    gasolinaConsumida: 3.8,
    tiempoRecorrido: '45 min',
    tiempoEstimado: '45 min',
    estado: 'completado'
  },
  {
    id: '4',
    fecha: '2026-05-16',
    horaSalida: '14:00 PM',
    horaLlegada: '14:35 PM',
    unidad: 'Unidad 05',
    ruta: 'Ruta Directa CBTIS',
    chofer: 'Ana Torres',
    pasajeros: 28,
    gasolinaConsumida: 3.3,
    tiempoRecorrido: '35 min',
    tiempoEstimado: '35 min',
    estado: 'completado'
  },
  {
    id: '5',
    fecha: '2026-05-16',
    horaSalida: '18:00 PM',
    horaLlegada: '19:20 PM',
    unidad: 'Unidad 01',
    ruta: 'Ruta Regreso Sendero',
    chofer: 'Juan Pérez',
    pasajeros: 45,
    gasolinaConsumida: 5.1,
    tiempoRecorrido: '80 min',
    tiempoEstimado: '75 min',
    estado: 'retrasado'
  },
  {
    id: '6',
    fecha: '2026-05-15',
    horaSalida: '5:00 AM',
    horaLlegada: '6:25 AM',
    unidad: 'Unidad 01',
    ruta: 'Ruta Completa Matutina',
    chofer: 'Juan Pérez',
    pasajeros: 40,
    gasolinaConsumida: 5.2,
    tiempoRecorrido: '85 min',
    tiempoEstimado: '85 min',
    estado: 'completado'
  },
  {
    id: '7',
    fecha: '2026-05-15',
    horaSalida: '13:00 PM',
    horaLlegada: '13:42 PM',
    unidad: 'Unidad 03',
    ruta: 'Ruta Directa Universidad',
    chofer: 'Carlos Ramírez',
    pasajeros: 32,
    gasolinaConsumida: 3.7,
    tiempoRecorrido: '42 min',
    tiempoEstimado: '45 min',
    estado: 'completado'
  },
  {
    id: '8',
    fecha: '2026-05-15',
    horaSalida: '18:00 PM',
    horaLlegada: '19:15 PM',
    unidad: 'Unidad 01',
    ruta: 'Ruta Regreso Sendero',
    chofer: 'Juan Pérez',
    pasajeros: 43,
    gasolinaConsumida: 5.0,
    tiempoRecorrido: '75 min',
    tiempoEstimado: '75 min',
    estado: 'completado'
  },
];

export function Trips() {
  const [filterDate, setFilterDate] = useState('2026-05-16');

  const filteredTrips = trips.filter(trip => trip.fecha === filterDate);
  const completedTrips = filteredTrips.filter(t => t.estado === 'completado').length;
  const delayedTrips = filteredTrips.filter(t => t.estado === 'retrasado').length;
  const totalPassengers = filteredTrips.reduce((sum, t) => sum + t.pasajeros, 0);
  const totalFuel = filteredTrips.reduce((sum, t) => sum + t.gasolinaConsumida, 0);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'retrasado': return 'bg-red-100 text-red-800';
      case 'en_curso': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'completado': return 'Completado';
      case 'retrasado': return 'Retrasado';
      case 'en_curso': return 'En Curso';
      default: return estado;
    }
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
              <p className="text-green-100 text-sm">Viajes Completados</p>
              <p className="text-3xl font-bold mt-1">{completedTrips}</p>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-800">{new Date(trip.fecha).toLocaleDateString('es-MX')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      <div>{trip.horaSalida} - {trip.horaLlegada}</div>
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
                      <span className="text-sm text-gray-600">{trip.gasolinaConsumida} L</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-800">{trip.tiempoRecorrido}</div>
                      <div className="text-xs text-gray-500">Est: {trip.tiempoEstimado}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.estado)}`}>
                      {getStatusLabel(trip.estado)}
                    </span>
                  </td>
                </tr>
              ))}
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
