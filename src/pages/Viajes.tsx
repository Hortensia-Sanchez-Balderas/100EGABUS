import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Viaje, Ruta, Unidad, Chofer } from '../types';
import { Plus, CreditCard as Edit2, Navigation, Clock, Users, Fuel } from 'lucide-react';

export default function Viajes() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Viaje | null>(null);
  const [form, setForm] = useState<Partial<Viaje>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [vjRes, rtRes, unRes, chRes] = await Promise.all([
      supabase.from('viajes').select('*, rutas(nombre), unidades(numero_unidad), choferes(nombre)').order('fecha', { ascending: false }).order('hora_salida', { ascending: false }).limit(50),
      supabase.from('rutas').select('*').eq('activa', true),
      supabase.from('unidades').select('*').eq('estado_operativo', 'activa'),
      supabase.from('choferes').select('*').eq('activo', true),
    ]);
    setViajes(vjRes.data ?? []);
    setRutas(rtRes.data ?? []);
    setUnidades(unRes.data ?? []);
    setChoferes(chRes.data ?? []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (editing) {
      await supabase.from('viajes').update(form).eq('id', editing.id);
    } else {
      await supabase.from('viajes').insert(form);
    }
    setShowModal(false);
    loadData();
  }

  const today = new Date().toISOString().split('T')[0];
  const viajesHoy = viajes.filter(v => v.fecha === today);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Viajes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Registro operativo de viajes</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ fecha: today }); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Registrar Viaje
        </button>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Viajes Hoy', value: viajesHoy.length, icon: <Navigation size={18} />, color: 'text-green-700 bg-green-50' },
          { label: 'Pasajeros', value: viajesHoy.reduce((s, v) => s + (v.pasajeros ?? 0), 0), icon: <Users size={18} />, color: 'text-blue-700 bg-blue-50' },
          { label: 'Combustible', value: `${viajesHoy.reduce((s, v) => s + (v.gasolina_consumida ?? 0), 0).toFixed(1)} L`, icon: <Fuel size={18} />, color: 'text-teal-700 bg-teal-50' },
          { label: 'Tiempo Promedio', value: viajesHoy.length ? `${Math.round(viajesHoy.reduce((s, v) => s + (v.tiempo_real ?? 0), 0) / viajesHoy.length)} min` : '—', icon: <Clock size={18} />, color: 'text-amber-700 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Últimos 50 Viajes</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Ruta</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Unidad</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Chofer</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Horario</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Pasajeros</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Combustible</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Tiempo</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {viajes.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{new Date(v.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-4 py-3 text-gray-600">{v.rutas?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-md">
                        {v.unidades?.numero_unidad ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.choferes?.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {v.hora_salida ?? '—'} → {v.hora_llegada ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{v.pasajeros ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.gasolina_consumida ?? 0} L</td>
                    <td className="px-4 py-3 text-gray-600">{v.tiempo_real ? `${v.tiempo_real} min` : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditing(v); setForm({ ...v }); setShowModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {viajes.length === 0 && (
              <div className="text-center py-12 text-gray-400">No hay viajes registrados</div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar Viaje' : 'Registrar Viaje'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" required value={form.fecha ?? today} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ruta</label>
                <select value={form.ruta_id ?? ''} onChange={e => setForm(f => ({ ...f, ruta_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                <select value={form.unidad_id ?? ''} onChange={e => setForm(f => ({ ...f, unidad_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.numero_unidad} — {u.modelo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chofer</label>
                <select value={form.chofer_id ?? ''} onChange={e => setForm(f => ({ ...f, chofer_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {choferes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hora Salida</label>
                <input type="time" value={form.hora_salida ?? ''} onChange={e => setForm(f => ({ ...f, hora_salida: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hora Llegada</label>
                <input type="time" value={form.hora_llegada ?? ''} onChange={e => setForm(f => ({ ...f, hora_llegada: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pasajeros</label>
                <input type="number" value={form.pasajeros ?? ''} onChange={e => setForm(f => ({ ...f, pasajeros: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gasolina Consumida (L)</label>
                <input type="number" step="0.1" value={form.gasolina_consumida ?? ''} onChange={e => setForm(f => ({ ...f, gasolina_consumida: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tiempo Real (min)</label>
                <input type="number" value={form.tiempo_real ?? ''} onChange={e => setForm(f => ({ ...f, tiempo_real: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea value={form.observaciones ?? ''} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                  {editing ? 'Guardar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
