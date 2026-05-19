import { MapPin, Clock, Gauge, Bus } from 'lucide-react';

const routes = [
  {
    id: '1',
    nombre: 'Ruta Completa Matutina',
    horarioSalida: '5:00 AM',
    tiempoEstimado: '85 min',
    distancia: '45 km',
    numeroParadas: 12,
    unidadAsignada: 'Unidad 01',
    estado: 'activa'
  },
  {
    id: '2',
    nombre: 'Ruta Completa Matutina 2',
    horarioSalida: '5:30 AM',
    tiempoEstimado: '90 min',
    distancia: '48 km',
    numeroParadas: 10,
    unidadAsignada: 'Unidad 02',
    estado: 'activa'
  },
  {
    id: '3',
    nombre: 'Ruta Directa Universidad',
    horarioSalida: '13:00 PM',
    tiempoEstimado: '45 min',
    distancia: '32 km',
    numeroParadas: 3,
    unidadAsignada: 'Unidad 03',
    estado: 'activa'
  },
  {
    id: '4',
    nombre: 'Ruta Directa CBTIS',
    horarioSalida: '14:00 PM',
    tiempoEstimado: '35 min',
    distancia: '25 km',
    numeroParadas: 2,
    unidadAsignada: 'Unidad 04',
    estado: 'activa'
  },
  {
    id: '5',
    nombre: 'Ruta Regreso Sendero',
    horarioSalida: '18:00 PM',
    tiempoEstimado: '75 min',
    distancia: '42 km',
    numeroParadas: 8,
    unidadAsignada: 'Unidad 01',
    estado: 'activa'
  },
  {
    id: '6',
    nombre: 'Ruta Vespertina TEC',
    horarioSalida: '19:00 PM',
    tiempoEstimado: '50 min',
    distancia: '35 km',
    numeroParadas: 4,
    unidadAsignada: 'Unidad 05',
    estado: 'activa'
  },
];

export function OperatorRoutes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-800">Consulta de Rutas</h1>
        <p className="text-gray-600 mt-1">Información de rutas y horarios</p>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route) => (
          <div key={route.id} className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-bold text-lg">{route.nombre}</h3>
                  <p className="text-sm text-emerald-100">Salida: {route.horarioSalida}</p>
                </div>
                <Bus className="w-8 h-8" />
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Tiempo</p>
                    <p className="text-sm font-semibold text-gray-800">{route.tiempoEstimado}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Distancia</p>
                    <p className="text-sm font-semibold text-gray-800">{route.distancia}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Paradas</p>
                    <p className="text-sm font-semibold text-gray-800">{route.numeroParadas}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Bus className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Unidad</p>
                    <p className="text-sm font-semibold text-gray-800">{route.unidadAsignada}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-100">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Operativa
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
