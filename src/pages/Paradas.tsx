import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Parada } from '../types';
import { Plus, CreditCard as Edit2, Trash2, MapPin, Users, TrendingUp } from 'lucide-react';

export default function Paradas() {
  const [paradas, setParadas] = useState<(Parada & { total_estudiantes?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Parada | null>(null);
  const [form, setForm] = useState<Partial<Parada>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data: paradasData } = await supabase.from('paradas').select('*').order('nombre');
    const { data: estudiantesData } = await supabase.from('estudiantes').select('parada_id').eq('activo', true);

    const countMap: Record<string, number> = {};
    (estudiantesData ?? []).forEach(e => {
      if (e.parada_id) countMap[e.parada_id] = (countMap[e.parada_id] ?? 0) + 1;
    });

    const enriched = (paradasData ?? []).map(p => ({ ...p, total_estudiantes: countMap[p.id] ?? 0 }));
    enriched.sort((a, b) => (b.total_estudiantes ?? 0) - (a.total_estudiantes ?? 0));
    setParadas(enriched);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ activa: true });
    setShowModal(true);
  }

  function openEdit(p: Parada) {
    setEditing(p);
    setForm({ ...p });
    setShowModal(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (editing) {
      await supabase.from('paradas').update(form).eq('id', editing.id);
    } else {
      await supabase.from('paradas').insert(form);
    }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta parada?')) return;
    await supabase.from('paradas').delete().eq('id', id);
    loadData();
  }

  const maxEstudiantes = Math.max(...paradas.map(p => p.total_estudiantes ?? 0), 1);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paradas</h1>
          <p className="text-gray-500 text-sm mt-0.5">Puntos de abordaje del programa</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nueva Parada
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50 text-green-700"><MapPin size={18} /></div>
          <div>
            <div className="text-xl font-bold text-gray-900">{paradas.length}</div>
            <div className="text-xs text-gray-500">Total Paradas</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700"><Users size={18} /></div>
          <div>
            <div className="text-xl font-bold text-gray-900">{paradas.reduce((s, p) => s + (p.total_estudiantes ?? 0), 0)}</div>
            <div className="text-xs text-gray-500">Estudiantes Asignados</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700"><TrendingUp size={18} /></div>
          <div>
            <div className="text-xl font-bold text-gray-900">{paradas[0]?.total_estudiantes ?? 0}</div>
            <div className="text-xs text-gray-500">Parada más demandada</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paradas.map((p, idx) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.nombre}</h3>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      p.activa ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                    }`}>
                      {p.activa ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Users size={13} className="text-gray-400" />
                  {p.total_estudiantes} estudiantes
                </span>
                <span className="text-xs text-gray-400">
                  {((p.total_estudiantes ?? 0) / maxEstudiantes * 100).toFixed(0)}% de la máxima
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (p.total_estudiantes ?? 0) / maxEstudiantes > 0.8 ? 'bg-green-600' :
                    (p.total_estudiantes ?? 0) / maxEstudiantes > 0.5 ? 'bg-green-500' : 'bg-green-400'
                  }`}
                  style={{ width: `${(p.total_estudiantes ?? 0) / maxEstudiantes * 100}%` }}
                />
              </div>

              {(p.total_estudiantes ?? 0) < 10 && (p.total_estudiantes ?? 0) > 0 && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                  Baja demanda — considerar consolidación con parada cercana
                </div>
              )}

              {p.latitud && p.longitud && (
                <div className="mt-2 text-xs text-gray-400">
                  {p.latitud.toFixed(4)}, {p.longitud.toFixed(4)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar Parada' : 'Nueva Parada'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                <input required value={form.nombre ?? ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Latitud</label>
                  <input type="number" step="any" value={form.latitud ?? ''} onChange={e => setForm(f => ({ ...f, latitud: parseFloat(e.target.value) }))}
                    placeholder="25.9574"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Longitud</label>
                  <input type="number" step="any" value={form.longitud ?? ''} onChange={e => setForm(f => ({ ...f, longitud: parseFloat(e.target.value) }))}
                    placeholder="-100.1756"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activa" checked={form.activa ?? true} onChange={e => setForm(f => ({ ...f, activa: e.target.checked }))}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="activa" className="text-sm text-gray-700">Parada activa</label>
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
