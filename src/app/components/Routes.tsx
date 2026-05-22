import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Clock, Gauge, Bus, CheckCircle, AlertCircle } from 'lucide-react';


interface Route {
  id: string;
  nombre: string;
  tipo: 'completa' | 'directa';
  tiempo_estimado: number;
  distancia: number;
  numero_paradas: number;
  horario_salida: string;
  estado: 'activa' | 'inactiva';
  paradas: string[];
}

export function Routes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const { data: routesData, error: routesError } = await supabase
        .from('rutas')
        .select('*')
        .order('nombre', { ascending: true });

      if (routesError) {
        console.error('Error loading routes:', routesError);
        alert('Error al cargar rutas: ' + routesError.message);
      } else {
        setRoutes(routesData || []);
      }
      
      // Load trips to calculate efficiency
      const { data: tripsData } = await supabase
        .from('viajes')
        .select('ruta, retraso, pasajeros, gasolina_consumida');
      
      setTrips(tripsData || []);
    } catch (error) {
      console.error('Error loading routes:', error);
      alert('Error al cargar rutas');
    } finally {
      setLoading(false);
    }
  };

  const activeRoutes = routes.filter(r => r.estado === 'activa').length;
  const totalDistance = routes.reduce((sum, r) => sum + (r.distancia || 0), 0);
  const avgTime = routes.length > 0 ? routes.reduce((sum, r) => sum + (r.tiempo_estimado || 0), 0) / routes.length : 0;
  
  // Calculate route efficiency metrics
  const routeEfficiency = routes.map(route => {
    const routeTrips = trips.filter(t => t.ruta === route.nombre);
    const onTimeTrips = routeTrips.filter(t => (t.retraso || 0) <= 15).length;
    const efficiency = routeTrips.length > 0 ? Math.round((onTimeTrips / routeTrips.length) * 100) : 0;
    const avgPassengers = routeTrips.length > 0 ? Math.round(routeTrips.reduce((sum, t) => sum + (t.pasajeros || 0), 0) / routeTrips.length) : 0;
    
    return {
      nombre: route.nombre,
      efficiency,
      avgPassengers,
      totalTrips: routeTrips.length
    };
  });
  
  // Find best and worst performing routes
  const bestRoute = routeEfficiency.reduce((prev, current) => 
    prev.efficiency > current.efficiency ? prev : current, routeEfficiency[0] || { efficiency: 0 });
  
  const worstRoute = routeEfficiency.reduce((prev, current) => 
    prev.efficiency < current.efficiency ? prev : current, routeEfficiency[0] || { efficiency: 100 });
  
  // Average efficiency across all routes
  const avgEfficiency = routeEfficiency.length > 0 
    ? Math.round(routeEfficiency.reduce((sum, r) => sum + r.efficiency, 0) / routeEfficiency.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Gestión de Rutas</h1>
        <div className="flex items-center space-x-2 text-sm text-emerald-600">
          <Clock className="w-4 h-4" />
          <span>Actualizado en tiempo real</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Rutas Activas</p>
              <p className="text-3xl font-bold mt-1">{activeRoutes}</p>
            </div>
            <MapPin className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Distancia Total</p>
              <p className="text-3xl font-bold mt-1">{totalDistance.toFixed(0)} km</p>
            </div>
            <Gauge className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Tiempo Promedio</p>
              <p className="text-3xl font-bold mt-1">{Math.round(avgTime)} min</p>
            </div>
            <Clock className="w-10 h-10 text-teal-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-lime-600 to-lime-700 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lime-100 text-sm">Rutas Completas</p>
              <p className="text-3xl font-bold mt-1">{routes.filter(r => r.tipo === 'completa').length}</p>
            </div>
            <Bus className="w-10 h-10 text-lime-200" />
          </div>
        </div>
      </div>

      {/* Route Cards */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Cargando rutas...
        </div>
      ) : routes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          No hay rutas registradas
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden">
              {/* Header */}
              <div className={`p-4 ${route.tipo === 'completa' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-teal-500 to-teal-600'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-white">
                    <Bus className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">{route.nombre}</h3>
                      <p className="text-sm opacity-90">{route.horario_salida || '-'}</p>
                    </div>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-emerald-700">
                    {route.tipo === 'completa' ? 'Completa' : 'Directa'}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-500">Tiempo Estimado</p>
                      <p className="font-semibold text-gray-800">{route.tiempo_estimado || 0} min</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-500">Distancia</p>
                      <p className="font-semibold text-gray-800">{route.distancia?.toFixed(1) || 0} km</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Número de Paradas</p>
                    <p className="font-semibold text-gray-800">{route.numero_paradas || 0} paradas</p>
                  </div>
                </div>

                {/* Timeline de Recorrido */}
                {route.paradas && route.paradas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-emerald-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">Recorrido</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {route.paradas.map((parada, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex flex-col items-center">
                            {index === 0 ? (
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            ) : index === route.paradas.length - 1 ? (
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                            )}
                            {index < route.paradas.length - 1 && (
                              <div className="w-0.5 h-8 bg-emerald-200"></div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">{parada}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estado */}
                <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
                  <div className="flex items-center space-x-2">
                    {route.estado === 'activa' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Operativa</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Inactiva</span>
                      </>
                    )}
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
