import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Mantenimiento, Unidad } from '../types';
import { Plus, CreditCard as Edit2, Wrench, DollarSign } from 'lucide-react';

export default function Mantenimientos() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Mantenimiento | null>(null);
  const [form, setForm] = useState<Partial<Mantenimiento>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [mRes, uRes] = await Promise.all([
      supabase.from('mantenimientos').select('*, unidades(numero_unidad, modelo)').order('fecha', { ascending: false }),
      supabase.from('unidades').select('*').order('numero_unidad'),
    ]);
    setMantenimientos(mRes.data ?? []);
    setUnidades(uRes.data ?? []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (editing) {
      await supabase.from('mantenimientos').update(form).eq('id', editing.id);
    } else {
      await supabase.from('mantenimientos').insert(form);
    }
    setShowModal(false);
    loadData();
  }

  const today = new Date().toISOString().split('T')[0];
  const costoTotal = mantenimientos.reduce((s, m) => s + (m.costo ?? 0), 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimientos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Historial de mantenimiento de unidades</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ fecha: today, costo: 0 }); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nuevo Mantenimiento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50 text-green-700"><Wrench size={18} /></div>
          <div>
            <div className="text-xl font-bold text-gray-900">{mantenimientos.length}</div>
            <div className="text-xs text-gray-500">Total Servicios</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700"><DollarSign size={18} /></div>
          <div>
            <div className="text-xl font-bold text-gray-900">${costoTotal.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Costo Total</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700"><Wrench size={18} /></div>
          <div>
            <div className="text-xl font-bold text-gray-900">
              ${mantenimientos.length > 0 ? Math.round(costoTotal / mantenimientos.length).toLocaleString() : 0}
            </div>
            <div className="text-xs text-gray-500">Costo Promedio</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Unidad</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Descripción</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Costo</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mantenimientos.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">{new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-md">
                        {m.unidades ? (m.unidades as Unidad).numero_unidad : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">{m.descripcion}</td>
                    <td className="px-4 py-3">
                      {(m.costo ?? 0) > 0 ? (
                        <span className="text-amber-700 font-medium">${(m.costo ?? 0).toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400">$0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditing(m); setForm({ ...m }); setShowModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mantenimientos.length === 0 && (
              <div className="text-center py-12 text-gray-400">No hay registros de mantenimiento</div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unidad *</label>
                <select required value={form.unidad_id ?? ''} onChange={e => setForm(f => ({ ...f, unidad_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.numero_unidad} — {u.modelo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" required value={form.fecha ?? today} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea required value={form.descripcion ?? ''} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Costo (MXN)</label>
                <input type="number" step="0.01" value={form.costo ?? 0} onChange={e => setForm(f => ({ ...f, costo: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex gap-3 pt-2">
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
