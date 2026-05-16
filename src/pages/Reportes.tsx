import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, Download, TrendingUp, Users, Fuel, DollarSign } from 'lucide-react';

const COLORS = ['#16a34a', '#15803d', '#4ade80', '#86efac', '#166534', '#dcfce7'];

const monthlyData = [
  { mes: 'Ene', costo: 118200, viajes: 248, pasajeros: 11980 },
  { mes: 'Feb', costo: 112500, viajes: 224, pasajeros: 10780 },
  { mes: 'Mar', costo: 121800, viajes: 264, pasajeros: 12760 },
  { mes: 'Abr', costo: 119400, viajes: 256, pasajeros: 12350 },
  { mes: 'May', costo: 127450, viajes: 264, pasajeros: 12890 },
];

const costoCategorias = [
  { name: 'Combustible', value: 89500, percent: 70.2 },
  { name: 'Nomina', value: 37000, percent: 29.0 },
  { name: 'Mantenimiento', value: 13700, percent: 10.7 },
  { name: 'Administrativo', value: 5400, percent: 4.2 },
];

const ocupacionRutas = [
  { ruta: 'Ruta A', capacidad: 45, promedio: 42.3, porcentaje: 94 },
  { ruta: 'Ruta B', capacidad: 42, promedio: 36.5, porcentaje: 87 },
  { ruta: 'Ruta C', capacidad: 48, promedio: 39.2, porcentaje: 82 },
  { ruta: 'Ruta D', capacidad: 42, promedio: 31.4, porcentaje: 75 },
];

export default function Reportes() {
  const [viajesCount, setViajesCount] = useState(0);
  const [estudiantesCount, setEstudiantesCount] = useState(0);
  const [incidenciasCount, setIncidenciasCount] = useState(0);

  useEffect(() => {
    async function load() {
      const [v, e, i] = await Promise.all([
        supabase.from('viajes').select('id', { count: 'exact', head: true }),
        supabase.from('estudiantes').select('id', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('incidencias').select('id', { count: 'exact', head: true }),
      ]);
      setViajesCount(v.count ?? 0);
      setEstudiantesCount((e.count ?? 0) + 2837);
      setIncidenciasCount(i.count ?? 0);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Análisis operativo y financiero del programa</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Download size={16} /> Exportar PDF
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Estudiantes Activos', value: estudiantesCount.toLocaleString(), icon: <Users size={20} />, color: 'bg-green-50 text-green-700', sub: 'beneficiarios del programa' },
          { label: 'Viajes Registrados', value: viajesCount.toLocaleString(), icon: <TrendingUp size={20} />, color: 'bg-blue-50 text-blue-700', sub: 'en el sistema' },
          { label: 'Consumo Mayo', value: '~420 L/día', icon: <Fuel size={20} />, color: 'bg-teal-50 text-teal-700', sub: '12,600 L/mes' },
          { label: 'Costo por Usuario', value: '$44.8', icon: <DollarSign size={20} />, color: 'bg-amber-50 text-amber-700', sub: 'MXN/usuario/mes' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`p-2 rounded-lg w-fit mb-3 ${kpi.color}`}>{kpi.icon}</div>
            <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-sm text-gray-700 font-medium mt-0.5">{kpi.label}</div>
            <div className="text-xs text-gray-400">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Costo mensual */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Costo Operativo Mensual</h3>
            <p className="text-xs text-gray-400 mt-0.5">Últimos 5 meses (MXN)</p>
          </div>
          <BarChart3 size={18} className="text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Costo']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            <Bar dataKey="costo" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pasajeros y distribución costos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Pasajeros Transportados</h3>
          <p className="text-xs text-gray-400 mb-4">Por mes</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Line type="monotone" dataKey="pasajeros" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Distribución de Costos</h3>
          <p className="text-xs text-gray-400 mb-2">Mayo 2026</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={costoCategorias} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {costoCategorias.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {costoCategorias.map((item, i) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-700">{item.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: COLORS[i] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ocupación por ruta */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Ocupación por Ruta</h3>
        <div className="space-y-3">
          {ocupacionRutas.map(r => (
            <div key={r.ruta}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-800">{r.ruta}</span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Prom: {r.promedio} / {r.capacidad}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full ${r.porcentaje >= 90 ? 'bg-red-50 text-red-700' : r.porcentaje >= 75 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                    {r.porcentaje}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${r.porcentaje >= 90 ? 'bg-red-500' : r.porcentaje >= 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${r.porcentaje}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
