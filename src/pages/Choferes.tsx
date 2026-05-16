import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Chofer, Unidad } from '../types';
import { Plus, CreditCard as Edit2, Trash2, CircleUser as UserCircle, Phone, CreditCard } from 'lucide-react';

export default function Choferes() {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Chofer | null>(null);
  const [form, setForm] = useState<Partial<Chofer>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [chRes, unRes] = await Promise.all([
      supabase.from('choferes').select('*, unidades(numero_unidad, modelo)').order('nombre'),
      supabase.from('unidades').select('*').eq('estado_operativo', 'activa').order('numero_unidad'),
    ]);
    setChoferes(chRes.data ?? []);
    setUnidades(unRes.data ?? []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (editing) {
      await supabase.from('choferes').update(form).eq('id', editing.id);
    } else {
      await supabase.from('choferes').insert(form);
    }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este chofer?')) return;
    await supabase.from('choferes').delete().eq('id', id);
    loadData();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choferes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Conductores del programa</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ activo: true }); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nuevo Chofer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {choferes.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold">{c.nombre.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.nombre}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c); setForm({ ...c }); setShowModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {c.telefono && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={13} className="text-gray-400" />
                    {c.telefono}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard size={13} className="text-gray-400" />
                  Lic. {c.licencia}
                </div>
                {c.unidades && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserCircle size={13} className="text-gray-400" />
                    {(c.unidades as Unidad).numero_unidad} — {(c.unidades as Unidad).modelo}
                  </div>
                )}
              </div>
            </div>
          ))}
          {choferes.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">No hay choferes registrados</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar Chofer' : 'Nuevo Chofer'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input required value={form.nombre ?? ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                <input value={form.telefono ?? ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">No. Licencia *</label>
                <input required value={form.licencia ?? ''} onChange={e => setForm(f => ({ ...f, licencia: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unidad Asignada</label>
                <select value={form.unidad_asignada ?? ''} onChange={e => setForm(f => ({ ...f, unidad_asignada: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Sin asignar</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{u.numero_unidad} — {u.modelo}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="choferActivo" checked={form.activo ?? true} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="choferActivo" className="text-sm text-gray-700">Chofer activo</label>
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
