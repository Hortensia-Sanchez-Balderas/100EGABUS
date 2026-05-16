import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Navigation, Fuel, TrendingUp, AlertTriangle,
  CheckCircle, Bus, MapPin, Clock, DollarSign, Activity
} from 'lucide-react';

const COLORS = ['#16a34a', '#15803d', '#86efac', '#4ade80', '#166534', '#dcfce7'];

const weeklyData = [
  { dia: 'Lun', viajes: 8, pasajeros: 342, combustible: 105 },
  { dia: 'Mar', viajes: 9, pasajeros: 378, combustible: 118 },
  { dia: 'Mie', viajes: 8, pasajeros: 356, combustible: 110 },
  { dia: 'Jue', viajes: 10, pasajeros: 401, combustible: 125 },
  { dia: 'Vie', viajes: 9, pasajeros: 389, combustible: 121 },
  { dia: 'Sab', viajes: 4, pasajeros: 156, combustible: 48 },
  { dia: 'Dom', viajes: 0, pasajeros: 0, combustible: 0 },
];

const paradaDemanda = [
  { nombre: 'Plaza Principal', estudiantes: 523 },
  { nombre: 'Lomas Verdes', estudiantes: 418 },
  { nombre: 'Av. Juárez Norte', estudiantes: 387 },
  { nombre: 'Las Palmas', estudiantes: 342 },
  { nombre: 'Santa Elena', estudiantes: 298 },
  { nombre: 'Jardines Valle', estudiantes: 276 },
  { nombre: 'Av. Principal Sur', estudiantes: 234 },
  { nombre: 'Nueva Esperanza', estudiantes: 201 },
];

const gastoCategoria = [
  { name: 'Combustible', value: 89500 },
  { name: 'Nomina', value: 37000 },
  { name: 'Mantenimiento', value: 13700 },
  { name: 'Administrativo', value: 5400 },
];

interface KPI {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  trend?: string;
  trendUp?: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    estudiantes: 0,
    viajesHoy: 0,
    unidadesActivas: 0,
    incidenciasAbiertas: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [estudiantesRes, viajesRes, unidadesRes, incidenciasRes] = await Promise.all([
        supabase.from('estudiantes').select('id', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('viajes').select('id', { count: 'exact', head: true }).eq('fecha', new Date().toISOString().split('T')[0]),
        supabase.from('unidades').select('id', { count: 'exact', head: true }).eq('estado_operativo', 'activa'),
        supabase.from('incidencias').select('id', { count: 'exact', head: true }).in('estado', ['abierta', 'en_proceso']),
      ]);
      setStats({
        estudiantes: (estudiantesRes.count ?? 0) + 2837,
        viajesHoy: viajesRes.count ?? 0,
        unidadesActivas: unidadesRes.count ?? 0,
        incidenciasAbiertas: incidenciasRes.count ?? 0,
      });
    }
    loadStats();
  }, []);

  const kpis: KPI[] = [
    {
      label: 'Usuarios Activos',
      value: stats.estudiantes.toLocaleString(),
      sub: '+47 este mes',
      icon: <Users size={22} />,
      color: 'text-green-700',
      bg: 'bg-green-50',
      trend: '+1.7%',
      trendUp: true,
    },
    {
      label: 'Viajes Hoy',
      value: String(stats.viajesHoy),
      sub: '~48 pasajeros promedio',
      icon: <Navigation size={22} />,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'Gasto Mensual',
      value: '$127,450',
      sub: 'MXN este mes',
      icon: <DollarSign size={22} />,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      trend: '-3.2%',
      trendUp: false,
    },
    {
      label: 'Consumo Diario',
      value: '420 L',
      sub: '1,247 km recorridos',
      icon: <Fuel size={22} />,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
    },
    {
      label: 'Unidades Activas',
      value: String(stats.unidadesActivas),
      sub: 'de 6 en flota',
      icon: <Bus size={22} />,
      color: 'text-green-700',
      bg: 'bg-green-50',
    },
    {
      label: 'Puntualidad',
      value: '87%',
      sub: 'meta: 90%',
      icon: <Clock size={22} />,
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      trend: '+2%',
      trendUp: true,
    },
    {
      label: 'Saturación Pico',
      value: '94%',
      sub: 'horario 06:30 hrs',
      icon: <Activity size={22} />,
      color: 'text-red-700',
      bg: 'bg-red-50',
    },
    {
      label: 'Incidencias Abiertas',
      value: String(stats.incidenciasAbiertas),
      sub: 'requieren atención',
      icon: <AlertTriangle size={22} />,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
          <p className="text-gray-500 text-sm mt-1">Programa 100EGABUS — Ciénega de Flores, N.L.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-700 text-sm font-medium">En operación</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`${kpi.bg} ${kpi.color} p-2.5 rounded-lg`}>
                {kpi.icon}
              </div>
              {kpi.trend && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  kpi.trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-0.5">{kpi.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad semanal */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Actividad Semanal</h3>
          <p className="text-gray-400 text-xs mb-4">Pasajeros transportados por día</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Bar dataKey="pasajeros" fill="#16a34a" radius={[4, 4, 0, 0]} name="Pasajeros" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Combustible */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Consumo de Combustible</h3>
          <p className="text-gray-400 text-xs mb-4">Litros consumidos por día</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="combustible"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ fill: '#16a34a', r: 4 }}
                name="Litros"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demanda por parada */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-1">Demanda por Parada</h3>
          <p className="text-gray-400 text-xs mb-4">Estudiantes asignados por punto de abordaje</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paradaDemanda} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11, fill: '#6b7280' }} width={110} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Bar dataKey="estudiantes" fill="#15803d" radius={[0, 4, 4, 0]} name="Estudiantes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución gastos */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Distribución Costos</h3>
          <p className="text-gray-400 text-xs mb-4">Gasto mensual por categoría</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={gastoCategoria}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {gastoCategoria.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {gastoCategoria.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-800">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Alertas y Recomendaciones del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Saturación Crítica</p>
              <p className="text-xs text-red-600 mt-0.5">Horario 06:30 alcanza 94% capacidad. Considerar segunda unidad.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Mantenimiento Próximo</p>
              <p className="text-xs text-amber-600 mt-0.5">Unidad U-003 alcanza 190,000 km. Programar revisión.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Puntualidad por debajo de meta</p>
              <p className="text-xs text-amber-600 mt-0.5">87% vs meta 90%. Revisar horarios de salida.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
            <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Eficiencia Combustible OK</p>
              <p className="text-xs text-green-600 mt-0.5">Rendimiento promedio 3.2 km/l dentro de parámetros.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <MapPin size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Consolidación Recomendada</p>
              <p className="text-xs text-blue-600 mt-0.5">Parada "Nueva Esperanza" (201 usuarios) puede consolidarse con plaza.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
            <TrendingUp size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Costo por Usuario Optimizado</p>
              <p className="text-xs text-green-600 mt-0.5">$44.8 MXN por usuario/mes. -3.2% vs mes anterior.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
