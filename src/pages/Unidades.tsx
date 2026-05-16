import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Unidad } from '../types';
import { Plus, CreditCard as Edit2, Trash2, Truck, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

const estadoConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  activa: { label: 'Activa', color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle size={12} /> },
  mantenimiento: { label: 'Mantenimiento', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Wrench size={12} /> },
  fuera_servicio: { label: 'Fuera de Servicio', color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle size={12} /> },
};

export default function Unidades() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Unidad | null>(null);
  const [form, setForm] = useState<Partial<Unidad>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('unidades').select('*').order('numero_unidad');
    setUnidades(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (editing) {
      await supabase.from('unidades').update(form).eq('id', editing.id);
    } else {
      await supabase.from('unidades').insert(form);
    }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta unidad?')) return;
    await supabase.from('unidades').delete().eq('id', id);
    loadData();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unidades</h1>
          <p className="text-gray-500 text-sm mt-0.5">Flota de autobuses del programa</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ estado_operativo: 'activa', capacidad: 40, rendimiento_km_l: 3.2, capacidad_tanque: 250 }); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nueva Unidad
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Activas', value: unidades.filter(u => u.estado_operativo === 'activa').length, color: 'bg-green-50 text-green-700' },
          { label: 'En Mantenimiento', value: unidades.filter(u => u.estado_operativo === 'mantenimiento').length, color: 'bg-amber-50 text-amber-700' },
          { label: 'Fuera de Servicio', value: unidades.filter(u => u.estado_operativo === 'fuera_servicio').length, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`text-2xl font-bold ${s.color.split(' ')[1]} mb-1`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unidades.map(u => {
            const estado = estadoConfig[u.estado_operativo];
            const kmAlerta = (u.kilometraje ?? 0) > 180000;
            return (
              <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${u.estado_operativo === 'activa' ? 'bg-green-100 text-green-700' : u.estado_operativo === 'mantenimiento' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{u.numero_unidad}</h3>
                      <p className="text-xs text-gray-500">{u.modelo}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(u); setForm({ ...u }); setShowModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${estado.color} mb-3`}>
                  {estado.icon}
                  {estado.label}
                </span>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-500 mb-0.5">Capacidad</div>
                    <div className="font-semibold text-gray-900">{u.capacidad} pasajeros</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-500 mb-0.5">Rendimiento</div>
                    <div className="font-semibold text-gray-900">{u.rendimiento_km_l} km/L</div>
                  </div>
                  <div className={`rounded-lg p-2.5 ${kmAlerta ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <div className="text-xs text-gray-500 mb-0.5">Kilometraje</div>
                    <div className={`font-semibold ${kmAlerta ? 'text-amber-700' : 'text-gray-900'}`}>
                      {(u.kilometraje ?? 0).toLocaleString()} km
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-500 mb-0.5">Tanque</div>
                    <div className="font-semibold text-gray-900">{u.capacidad_tanque} L</div>
                  </div>
                </div>

                {kmAlerta && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={13} />
                    Programar mantenimiento preventivo
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar Unidad' : 'Nueva Unidad'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Número de Unidad *</label>
                <input required value={form.numero_unidad ?? ''} onChange={e => setForm(f => ({ ...f, numero_unidad: e.target.value }))}
                  placeholder="U-007"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Modelo *</label>
                <input required value={form.modelo ?? ''} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Capacidad (pasajeros)</label>
                <input type="number" value={form.capacidad ?? 40} onChange={e => setForm(f => ({ ...f, capacidad: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rendimiento (km/L)</label>
                <input type="number" step="0.1" value={form.rendimiento_km_l ?? 3.2} onChange={e => setForm(f => ({ ...f, rendimiento_km_l: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Capacidad Tanque (L)</label>
                <input type="number" value={form.capacidad_tanque ?? 250} onChange={e => setForm(f => ({ ...f, capacidad_tanque: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kilometraje</label>
                <input type="number" value={form.kilometraje ?? 0} onChange={e => setForm(f => ({ ...f, kilometraje: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado Operativo</label>
                <select value={form.estado_operativo ?? 'activa'} onChange={e => setForm(f => ({ ...f, estado_operativo: e.target.value as Unidad['estado_operativo'] }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="activa">Activa</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
