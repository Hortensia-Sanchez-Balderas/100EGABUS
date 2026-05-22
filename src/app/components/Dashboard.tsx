import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Users, MapPin, Bus, TrendingUp, Clock, Fuel, AlertTriangle, AlertCircle, DollarSign, Zap, Wrench } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

export function Dashboard() {
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [paradas, setParadas] = useState<any[]>([]);
  const [viajes, setViajes] = useState<any[]>([]);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [estudiantesRes, paradasRes, viajesRes, incidenciasRes, unidadesRes] = await Promise.all([
        supabase.from('estudiantes').select('parada_asignada, estado'),
        supabase.from('paradas').select('nombre, capacidad'),
        supabase.from('viajes').select('ruta, pasajeros, fecha, gasolina_consumida, retraso'),
        supabase.from('incidencias').select('id, tipo, fecha, descripcion, resuelto'),
        supabase.from('unidades').select('id, placa, proximo_mantenimiento')
      ]);

      if (estudiantesRes.data) setEstudiantes(estudiantesRes.data);
      if (paradasRes.data) setParadas(paradasRes.data);
      if (viajesRes.data) setViajes(viajesRes.data);
      if (incidenciasRes.data) setIncidencias(incidenciasRes.data);
      if (unidadesRes.data) setUnidades(unidadesRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate demand by stop - ensure unique parada names
  const demandByStopMap = new Map<string, number>();
  paradas
    .filter(parada => parada.nombre)
    .forEach(parada => {
      if (!demandByStopMap.has(parada.nombre)) {
        const usuarios = estudiantes.filter(
          est => est.parada_asignada === parada.nombre && est.estado === 'activo'
        ).length;
        demandByStopMap.set(parada.nombre, usuarios);
      }
    });
  const demandByStop = Array.from(demandByStopMap.entries())
    .map(([name, usuarios]) => ({ name, usuarios }))
    .slice(0, 6);

  // Calculate route distribution
  const routeDistribution = viajes
    .filter(viaje => viaje.ruta) // Filter out null/undefined ruta
    .reduce((acc: any[], viaje) => {
      const existing = acc.find(r => r.name === viaje.ruta);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: viaje.ruta, value: 1 });
      }
      return acc;
    }, [])
    .slice(0, 4);

  // Calculate demand by schedule from viajes
  const demandBySchedule = viajes
    .filter(viaje => viaje.hora_salida_real)
    .reduce((acc: any[], viaje) => {
      // Extract hour from time string (HH:MM format)
      const hour = viaje.hora_salida_real.split(':')[0];
      const existing = acc.find(d => d.hora === `${hour}:00`);
      if (existing) {
        existing.pasajeros += viaje.pasajeros || 0;
      } else {
        acc.push({ hora: `${hour}:00`, pasajeros: viaje.pasajeros || 0 });
      }
      return acc;
    }, [])
    .sort((a, b) => parseInt(a.hora) - parseInt(b.hora));

  // Calculate weekly usage from trips - real data
  const weeklyUsage = [
    { dia: 'Lun', uso: viajes.filter(v => v.fecha && new Date(v.fecha).getDay() === 1).length },
    { dia: 'Mar', uso: viajes.filter(v => v.fecha && new Date(v.fecha).getDay() === 2).length },
    { dia: 'Mié', uso: viajes.filter(v => v.fecha && new Date(v.fecha).getDay() === 3).length },
    { dia: 'Jue', uso: viajes.filter(v => v.fecha && new Date(v.fecha).getDay() === 4).length },
    { dia: 'Vie', uso: viajes.filter(v => v.fecha && new Date(v.fecha).getDay() === 5).length },
  ];

  const activeStudents = estudiantes.filter(e => e.estado === 'activo').length;
  const totalStops = paradas.length;
  const dailyTrips = viajes.length > 0 ? Math.round(viajes.length / 7) : 342;
  const avgOccupancy = viajes.length > 0
    ? Math.round((viajes.reduce((sum, v) => sum + (v.pasajeros || 0), 0) / viajes.length / 45) * 100)
    : 78;

  // Calculate average trip duration from real data
  const avgTripDuration = viajes.length > 0
    ? Math.round(viajes.reduce((sum, v) => sum + (v.tiempo_recorrido || 0), 0) / viajes.length)
    : 42;

  // Calculate monthly fuel consumption
  const monthlyFuelConsumption = viajes.length > 0
    ? Math.round(viajes.reduce((sum, v) => sum + (v.gasolina_consumida || 0), 0))
    : 4500;

  // Calculate route efficiency based on schedule compliance
  const routeEfficiency = viajes.length > 0
    ? Math.round(((viajes.filter(v => (v.retraso || 0) <= 15).length / viajes.length) * 100))
    : 87;

  // 💰 KPIs FINANCIEROS
  const totalPasajeros = viajes.reduce((sum, v) => sum + (v.pasajeros || 0), 0);
  const ingresosEstimados = totalPasajeros * 25; // $25 por pasajero
  const costoGasolina = (monthlyFuelConsumption || 0) * 25; // $25 por litro
  const costoMantenimiento = Math.round((unidades.filter(u => {
    const nextMaint = new Date(u.proximo_mantenimiento);
    return nextMaint < new Date();
  }).length) * 150); // Estimado $150 por unidad en mantenimiento urgente
  const costoOperativoTotal = costoGasolina + costoMantenimiento;
  const gananciaNetaEstimada = ingresosEstimados - costoOperativoTotal;
  const margenOperativo = ingresosEstimados > 0 ? Math.round((gananciaNetaEstimada / ingresosEstimados) * 100) : 0;

  // 🚨 ALERTAS CRÍTICAS
  interface Alert {
    id: string;
    titulo: string;
    descripcion: string;
    severidad: 'crítica' | 'importante' | 'info';
    icono: React.ReactNode;
  }

  const alertas: Alert[] = [];

  // Alertas de incidencias sin resolver
  incidencias.forEach(inc => {
    if (!inc.resuelto) {
      alertas.push({
        id: `inc-${inc.id}`,
        titulo: `Incidencia: ${inc.tipo}`,
        descripcion: inc.descripcion || 'Sin descripción',
        severidad: 'crítica',
        icono: <AlertTriangle className="w-5 h-5" />
      });
    }
  });

  // Alertas de mantenimiento vencido
  unidades.forEach(unidad => {
    const nextMaint = new Date(unidad.proximo_mantenimiento);
    if (nextMaint < new Date()) {
      alertas.push({
        id: `maint-${unidad.id}`,
        titulo: `Mantenimiento Vencido: ${unidad.placa}`,
        descripcion: `Requiere revisión urgente desde ${nextMaint.toLocaleDateString('es-MX')}`,
        severidad: 'crítica',
        icono: <Wrench className="w-5 h-5" />
      });
    }
  });

  // Alertas de paradas saturadas
  const demandMap = new Map<string, number>();
  paradas.forEach(parada => {
    const usuarios = estudiantes.filter(
      est => est.parada_asignada === parada.nombre && est.estado === 'activo'
    ).length;
    const saturacion = parada.capacidad > 0 ? Math.round((usuarios / parada.capacidad) * 100) : 0;
    if (saturacion > 85) {
      alertas.push({
        id: `sat-${parada.nombre}`,
        titulo: `Parada Saturada: ${parada.nombre}`,
        descripcion: `Saturación al ${saturacion}% - ${usuarios}/${parada.capacidad} usuarios`,
        severidad: 'importante',
        icono: <AlertCircle className="w-5 h-5" />
      });
    }
  });

  // Alerta de margen bajo
  if (margenOperativo < 20 && margenOperativo >= 0) {
    alertas.push({
      id: 'margen-bajo',
      titulo: 'Margen Operativo Bajo',
      descripcion: `Ganancia neta solo al ${margenOperativo}% - Revisar costos`,
      severidad: 'importante',
      icono: <TrendingUp className="w-5 h-5" />
    });
  }

  const alertasCríticas = alertas.filter(a => a.severidad === 'crítica').length;
  const alertasImportantes = alertas.filter(a => a.severidad === 'importante').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-emerald-800">Dashboard 100EGABUS</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Cargando datos del dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Dashboard 100EGABUS</h1>
        <div className="text-sm text-emerald-600">Actualizado: {new Date().toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Estudiantes Activos</p>
              <p className="text-3xl font-bold mt-2">{activeStudents.toLocaleString()}</p>
            </div>
            <Users className="w-12 h-12 text-emerald-200" />
          </div>
          <p className="text-emerald-100 text-sm mt-4">Total registrados</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Paradas Activas</p>
              <p className="text-3xl font-bold mt-2">{totalStops}</p>
            </div>
            <MapPin className="w-12 h-12 text-green-200" />
          </div>
          <p className="text-green-100 text-sm mt-4">En operación</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Viajes Diarios</p>
              <p className="text-3xl font-bold mt-2">{dailyTrips}</p>
            </div>
            <Bus className="w-12 h-12 text-teal-200" />
          </div>
          <p className="text-teal-100 text-sm mt-4">Promedio semanal</p>
        </div>

        <div className="bg-gradient-to-br from-lime-600 to-lime-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lime-100 text-sm">Ocupación Promedio</p>
              <p className="text-3xl font-bold mt-2">{avgOccupancy}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-lime-200" />
          </div>
          <p className="text-lime-100 text-sm mt-4">Capacidad óptima</p>
        </div>
      </div>

      {/* KPIs Financieros 💰 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Ingresos Estimados</p>
              <p className="text-3xl font-bold mt-2">${ingresosEstimados.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
          <p className="text-blue-100 text-xs mt-4">{totalPasajeros} pasajeros × $25</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Costo Operativo</p>
              <p className="text-3xl font-bold mt-2">${costoOperativoTotal.toLocaleString()}</p>
            </div>
            <Fuel className="w-12 h-12 text-orange-200" />
          </div>
          <p className="text-orange-100 text-xs mt-4">Gasolina + Mantenimiento</p>
        </div>

        <div className={`bg-gradient-to-br ${gananciaNetaEstimada > 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-lg p-6 text-white shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${gananciaNetaEstimada > 0 ? 'text-green-100' : 'text-red-100'} text-sm`}>Ganancia Neta</p>
              <p className="text-3xl font-bold mt-2">${gananciaNetaEstimada.toLocaleString()}</p>
            </div>
            <TrendingUp className={`w-12 h-12 ${gananciaNetaEstimada > 0 ? 'text-green-200' : 'text-red-200'}`} />
          </div>
          <p className={`${gananciaNetaEstimada > 0 ? 'text-green-100' : 'text-red-100'} text-xs mt-4`}>Diferencia</p>
        </div>

        <div className={`bg-gradient-to-br ${margenOperativo >= 25 ? 'from-purple-500 to-purple-600' : margenOperativo >= 15 ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600'} rounded-lg p-6 text-white shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${margenOperativo >= 25 ? 'text-purple-100' : margenOperativo >= 15 ? 'text-amber-100' : 'text-red-100'} text-sm`}>Margen Operativo</p>
              <p className="text-3xl font-bold mt-2">{margenOperativo}%</p>
            </div>
            <Zap className={`w-12 h-12 ${margenOperativo >= 25 ? 'text-purple-200' : margenOperativo >= 15 ? 'text-amber-200' : 'text-red-200'}`} />
          </div>
          <p className={`${margenOperativo >= 25 ? 'text-purple-100' : margenOperativo >= 15 ? 'text-amber-100' : 'text-red-100'} text-xs mt-4`}>Saludable</p>
        </div>
      </div>

      {/* Alertas Críticas 🚨 */}
      {alertas.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-800 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6" />
              <span>Alertas Críticas y Recomendaciones</span>
              {alertasCríticas > 0 && (
                <span className="ml-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {alertasCríticas} Crítica{alertasCríticas !== 1 ? 's' : ''}
                </span>
              )}
              {alertasImportantes > 0 && (
                <span className="ml-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {alertasImportantes} Importante{alertasImportantes !== 1 ? 's' : ''}
                </span>
              )}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-lg border-l-4 flex items-start space-x-3 ${
                  alerta.severidad === 'crítica'
                    ? 'bg-red-50 border-red-500 border-l-4'
                    : 'bg-orange-50 border-orange-500 border-l-4'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  alerta.severidad === 'crítica' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {alerta.icono}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${
                    alerta.severidad === 'crítica' ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {alerta.titulo}
                  </p>
                  <p className={`text-xs mt-1 ${
                    alerta.severidad === 'crítica' ? 'text-red-700' : 'text-orange-700'
                  }`}>
                    {alerta.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demanda por Parada */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Demanda por Parada</h2>
          {demandByStop.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demandByStop}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="name" stroke="#065f46" />
                <YAxis stroke="#065f46" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981' }}
                  labelStyle={{ color: '#065f46' }}
                />
                <Bar dataKey="usuarios" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos de paradas disponibles
            </div>
          )}
        </div>

        {/* Distribución por Ruta */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Distribución por Ruta</h2>
          {routeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={routeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {routeDistribution.map((entry, index) => (
                    <Cell key={`route-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos de rutas disponibles
            </div>
          )}
        </div>

        {/* Demanda por Horario */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Demanda por Horario</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandBySchedule}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="hora" stroke="#065f46" />
              <YAxis stroke="#065f46" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981' }}
                labelStyle={{ color: '#065f46' }}
              />
              <Legend />
              <Line type="monotone" dataKey="pasajeros" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Uso Semanal */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Uso Semanal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="dia" stroke="#065f46" />
              <YAxis stroke="#065f46" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981' }}
                labelStyle={{ color: '#065f46' }}
              />
              <Bar dataKey="uso" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indicadores Operativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-600">Tiempo Promedio de Recorrido</p>
              <p className="text-2xl font-bold text-emerald-700">{avgTripDuration} min</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center space-x-3">
            <Fuel className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Consumo Estimado (Mensual)</p>
              <p className="text-2xl font-bold text-green-700">
                {monthlyFuelConsumption.toLocaleString()} L
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-teal-600" />
            <div>
              <p className="text-sm text-gray-600">Eficiencia de Ruta</p>
              <p className="text-2xl font-bold text-teal-700">{routeEfficiency}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
