import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Ruta } from '../types';
import { Plus, CreditCard as Edit2, Trash2, Route, Clock, MapPin } from 'lucide-react';

export default function Rutas() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Ruta | null>(null);
  const [form, setForm] = useState<Partial<Ruta>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('rutas').select('*').order('nombre');
    setRutas(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (editing) {
      await supabase.from('rutas').update(form).eq('id', editing.id);
    } else {
      await supabase.from('rutas').insert(form);
    }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta ruta?')) return;
    await supabase.from('rutas').delete().eq('id', id);
    loadData();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rutas</h1>
          <p className="text-gray-500 text-sm mt-0.5">Rutas de transporte del programa</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ activa: true, tipo_ruta: 'completa' }); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nueva Ruta
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rutas.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${r.tipo_ruta === 'completa' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    <Route size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.nombre}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.tipo_ruta === 'completa' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {r.tipo_ruta === 'completa' ? 'Ruta Completa' : 'Ruta Directa'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(r); setForm({ ...r }); setShowModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <MapPin size={14} className="text-gray-400 mx-auto mb-1" />
                  <div className="text-sm font-bold text-gray-900">{r.distancia_km ?? '—'}</div>
                  <div className="text-xs text-gray-500">km</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Clock size={14} className="text-gray-400 mx-auto mb-1" />
                  <div className="text-sm font-bold text-gray-900">{r.tiempo_estimado ?? '—'}</div>
                  <div className="text-xs text-gray-500">min estimados</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${r.activa ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div className="text-sm font-bold text-gray-900">{r.activa ? 'Activa' : 'Inactiva'}</div>
                  <div className="text-xs text-gray-500">estado</div>
                </div>
              </div>
            </div>
          ))}
          {rutas.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400">No hay rutas registradas</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar Ruta' : 'Nueva Ruta'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                <input required value={form.nombre ?? ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Ruta</label>
                <select value={form.tipo_ruta ?? 'completa'} onChange={e => setForm(f => ({ ...f, tipo_ruta: e.target.value as Ruta['tipo_ruta'] }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="completa">Completa</option>
                  <option value="directa">Directa</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Distancia (km)</label>
                  <input type="number" step="0.1" value={form.distancia_km ?? ''} onChange={e => setForm(f => ({ ...f, distancia_km: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tiempo estimado (min)</label>
                  <input type="number" value={form.tiempo_estimado ?? ''} onChange={e => setForm(f => ({ ...f, tiempo_estimado: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rutaActiva" checked={form.activa ?? true} onChange={e => setForm(f => ({ ...f, activa: e.target.checked }))}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="rutaActiva" className="text-sm text-gray-700">Ruta activa</label>
              </div>
              <div className="flex gap-3 pt-2">
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
