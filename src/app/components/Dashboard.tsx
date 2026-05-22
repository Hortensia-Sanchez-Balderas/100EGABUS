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
        supabase.from('estudiantes').select('parada_asignada, estado, horario_ida, horario_regreso'),
        supabase.from('paradas').select('nombre, capacidad'),
        supabase.from('viajes').select('ruta, pasajeros, fecha, gasolina_consumida, retraso, hora_salida_real'),
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

  // 📊 RENTABILIDAD POR RUTA
  const rutaMap = new Map<string, { pasajeros: number; gasolina: number }>();
  viajes.forEach(viaje => {
    if (viaje.ruta) {
      const current = rutaMap.get(viaje.ruta) || { pasajeros: 0, gasolina: 0 };
      rutaMap.set(viaje.ruta, {
        pasajeros: current.pasajeros + (viaje.pasajeros || 0),
        gasolina: current.gasolina + (viaje.gasolina_consumida || 0)
      });
    }
  });

  const rentabilidadPorRuta = Array.from(rutaMap.entries())
    .map(([ruta, datos]) => {
      const ingresos = datos.pasajeros * 25;
      const costos = (datos.gasolina * 25) + (datos.gasolina > 0 ? 150 : 0); // $150 mantenimiento estimado
      const ganancia = ingresos - costos;
      const margen = ingresos > 0 ? Math.round((ganancia / ingresos) * 100) : 0;
      return {
        ruta,
        ingresos,
        costos,
        ganancia,
        margen
      };
    })
    .sort((a, b) => b.ganancia - a.ganancia);

  // 🔥 MATRIZ DE SATURACIÓN PARADA/HORA
  const horasPico = ['05:00', '06:00', '07:00', '08:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const matriceSaturacion: any[] = [];

  paradas.forEach(parada => {
    const filaParada: any = { parada: parada.nombre, capacidad: parada.capacidad };
    
    horasPico.forEach(hora => {
      // Contar estudiantes con horario_ida o horario_regreso que coincida
      const estudiantesEnHora = estudiantes.filter(est => {
        if (est.parada_asignada !== parada.nombre || est.estado !== 'activo') return false;
        
        // Extraer hora de los horarios
        const idaHour = est.horario_ida?.split(':')[0];
        const regresoHour = est.horario_regreso?.split(':')[0];
        const horaTarget = hora.split(':')[0];
        
        return idaHour === horaTarget || regresoHour === horaTarget;
      }).length;
      
      const saturacion = parada.capacidad > 0 ? Math.round((estudiantesEnHora / parada.capacidad) * 100) : 0;
      filaParada[hora] = saturacion;
    });
    
    matriceSaturacion.push(filaParada);
  });

  // Función para obtener color según saturación
  const getHeatmapColor = (saturacion: number) => {
    if (saturacion >= 85) return '#dc2626'; // Rojo
    if (saturacion >= 70) return '#f97316'; // Naranja
    if (saturacion >= 50) return '#eab308'; // Ámbar
    if (saturacion >= 30) return '#84cc16'; // Lima
    return '#22c55e'; // Verde
  };

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

      {/* NUEVAS GRÁFICAS ANALÍTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rentabilidad por Ruta */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">💰 Rentabilidad por Ruta</h2>
          {rentabilidadPorRuta.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rentabilidadPorRuta.map((ruta, idx) => {
                const margenColor = 
                  ruta.margen >= 30 ? 'from-green-100 to-green-50 border-green-300' :
                  ruta.margen >= 15 ? 'from-amber-100 to-amber-50 border-amber-300' :
                  'from-red-100 to-red-50 border-red-300';

                const margenBgColor =
                  ruta.margen >= 30 ? 'bg-green-100 text-green-800' :
                  ruta.margen >= 15 ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800';

                return (
                  <div key={ruta.ruta} className={`bg-gradient-to-r ${margenColor} p-4 rounded-lg border-l-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{ruta.ruta}</h3>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${margenBgColor}`}>
                        {ruta.margen > 0 ? '+' : ''}{ruta.margen}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Ingresos</p>
                        <p className="font-bold text-gray-800">${ruta.ingresos.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Costos</p>
                        <p className="font-bold text-gray-800">${ruta.costos.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ganancia</p>
                        <p className={`font-bold ${ruta.ganancia > 0 ? 'text-green-800' : 'text-red-800'}`}>
                          ${ruta.ganancia.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              No hay datos de rutas disponibles
            </div>
          )}
        </div>

        {/* Matriz de Saturación Parada/Hora */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-red-100">
          <h2 className="text-xl font-semibold text-red-800 mb-4">🔥 Matriz de Saturación (Parada/Hora)</h2>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header con horas */}
              <div className="flex mb-2">
                <div className="w-32 flex-shrink-0 font-bold text-sm text-gray-700 p-2">Parada</div>
                {horasPico.map(hora => (
                  <div key={`header-${hora}`} className="w-12 flex-shrink-0 text-center font-bold text-xs text-gray-700 p-1">
                    {hora}
                  </div>
                ))}
              </div>
              
              {/* Filas de paradas */}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {matriceSaturacion.map((fila, idx) => (
                  <div key={`row-${idx}`} className="flex">
                    <div className="w-32 flex-shrink-0 text-xs text-gray-800 p-2 truncate font-medium">
                      {fila.parada}
                    </div>
                    {horasPico.map(hora => {
                      const saturacion = fila[hora] || 0;
                      const color = getHeatmapColor(saturacion);
                      return (
                        <div
                          key={`${fila.parada}-${hora}`}
                          className="w-12 flex-shrink-0 p-1"
                        >
                          <div
                            className="w-full h-8 rounded flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-110"
                            style={{ backgroundColor: color }}
                            title={`${saturacion}% - ${fila.parada} a ${hora}`}
                          >
                            {saturacion}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Leyenda */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
              <span>&lt;30%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }}></div>
              <span>30-50%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
              <span>50-70%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
              <span>70-85%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
              <span>≥85%</span>
            </div>
          </div>
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
