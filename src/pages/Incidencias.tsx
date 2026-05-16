import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Incidencia, Unidad } from '../types';
import { Plus, CreditCard as Edit2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const tipoConfig: Record<string, { label: string; color: string }> = {
  ponchadura: { label: 'Ponchadura', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  falla_mecanica: { label: 'Falla Mecánica', color: 'bg-red-50 text-red-700 border-red-200' },
  retraso: { label: 'Retraso', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  trafico: { label: 'Tráfico', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  accidente: { label: 'Accidente', color: 'bg-red-50 text-red-800 border-red-300' },
};

const estadoConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  abierta: { label: 'Abierta', icon: <AlertTriangle size={12} />, color: 'bg-red-50 text-red-700 border-red-200' },
  en_proceso: { label: 'En Proceso', icon: <Clock size={12} />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  resuelta: { label: 'Resuelta', icon: <CheckCircle size={12} />, color: 'bg-green-50 text-green-700 border-green-200' },
};

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Incidencia | null>(null);
  const [form, setForm] = useState<Partial<Incidencia>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [incRes, unRes] = await Promise.all([
      supabase.from('incidencias').select('*, unidades(numero_unidad)').order('fecha', { ascending: false }),
      supabase.from('unidades').select('*').order('numero_unidad'),
    ]);
    setIncidencias(incRes.data ?? []);
    setUnidades(unRes.data ?? []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (editing) {
      await supabase.from('incidencias').update(form).eq('id', editing.id);
    } else {
      await supabase.from('incidencias').insert(form);
    }
    setShowModal(false);
    loadData();
  }

  const today = new Date().toISOString().split('T')[0];
  const abiertas = incidencias.filter(i => i.estado !== 'resuelta').length;
  const costoTotal = incidencias.reduce((s, i) => s + (i.costo ?? 0), 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
          <p className="text-gray-500 text-sm mt-0.5">Registro de eventos operativos</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ estado: 'abierta', fecha: today, costo: 0 }); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nueva Incidencia
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: incidencias.length, color: 'text-gray-900' },
          { label: 'Abiertas', value: abiertas, color: 'text-red-700' },
          { label: 'Resueltas', value: incidencias.filter(i => i.estado === 'resuelta').length, color: 'text-green-700' },
          { label: 'Costo Total', value: `$${costoTotal.toLocaleString()}`, color: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {incidencias.map(inc => {
            const tipo = tipoConfig[inc.tipo];
            const estado = estadoConfig[inc.estado];
            return (
              <div key={inc.id} className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${inc.estado === 'abierta' ? 'border-red-100' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg mt-0.5 ${inc.estado === 'abierta' ? 'bg-red-100 text-red-600' : inc.estado === 'en_proceso' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${tipo.color}`}>{tipo.label}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${estado.color}`}>
                          {estado.icon}{estado.label}
                        </span>
                        {inc.unidades && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                            {(inc.unidades as Unidad).numero_unidad}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{inc.descripcion ?? 'Sin descripción'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{new Date(inc.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        {(inc.costo ?? 0) > 0 && <span className="text-amber-700 font-medium">Costo: ${(inc.costo ?? 0).toLocaleString()} MXN</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setEditing(inc); setForm({ ...inc }); setShowModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors ml-2">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {incidencias.length === 0 && (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">No hay incidencias registradas</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar Incidencia' : 'Nueva Incidencia'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo *</label>
                  <select required value={form.tipo ?? ''} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as Incidencia['tipo'] }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Seleccionar...</option>
                    {Object.entries(tipoConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha *</label>
                  <input type="date" required value={form.fecha ?? today} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                  <select value={form.unidad_id ?? ''} onChange={e => setForm(f => ({ ...f, unidad_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Seleccionar...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.numero_unidad}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Costo (MXN)</label>
                  <input type="number" step="0.01" value={form.costo ?? 0} onChange={e => setForm(f => ({ ...f, costo: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.descripcion ?? ''} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                <select value={form.estado ?? 'abierta'} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Incidencia['estado'] }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="abierta">Abierta</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="resuelta">Resuelta</option>
                </select>
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
