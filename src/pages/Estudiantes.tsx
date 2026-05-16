import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Estudiante, Parada } from '../types';
import { Plus, Search, CreditCard as Edit2, Trash2, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const ESCUELAS = ['UANL - FCA', 'UANL - FIME', 'UANL - FCB', 'ITESM Campus Monterrey', 'CETIS 76', 'CBETIS 168', 'Otra'];
const HORARIOS = ['06:30', '07:00', '07:30', '13:30', '14:00', '18:00', '18:30'];

const credencialColor: Record<string, string> = {
  vigente: 'bg-green-50 text-green-700 border-green-200',
  vencida: 'bg-red-50 text-red-700 border-red-200',
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
};

const credencialIcon: Record<string, React.ReactNode> = {
  vigente: <CheckCircle size={12} />,
  vencida: <XCircle size={12} />,
  pendiente: <Clock size={12} />,
};

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Estudiante | null>(null);
  const [form, setForm] = useState<Partial<Estudiante>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [estRes, parRes] = await Promise.all([
      supabase.from('estudiantes').select('*, paradas(nombre)').order('nombre_completo'),
      supabase.from('paradas').select('*').eq('activa', true).order('nombre'),
    ]);
    setEstudiantes(estRes.data ?? []);
    setParadas(parRes.data ?? []);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ activo: true, estado_credencial: 'vigente' });
    setShowModal(true);
  }

  function openEdit(e: Estudiante) {
    setEditing(e);
    setForm({ ...e });
    setShowModal(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (editing) {
      await supabase.from('estudiantes').update(form).eq('id', editing.id);
    } else {
      await supabase.from('estudiantes').insert(form);
    }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este estudiante?')) return;
    await supabase.from('estudiantes').delete().eq('id', id);
    loadData();
  }

  const filtered = estudiantes.filter(e =>
    e.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
    e.escuela.toLowerCase().includes(search.toLowerCase()) ||
    (e.matricula ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Beneficiarios del programa 100EGABUS</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nuevo Estudiante
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: estudiantes.length, icon: <Users size={18} />, color: 'text-green-700 bg-green-50' },
          { label: 'Activos', value: estudiantes.filter(e => e.activo).length, icon: <CheckCircle size={18} />, color: 'text-blue-700 bg-blue-50' },
          { label: 'Credencial Vigente', value: estudiantes.filter(e => e.estado_credencial === 'vigente').length, icon: <CheckCircle size={18} />, color: 'text-teal-700 bg-teal-50' },
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
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, escuela o matrícula..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} registros</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Estudiante</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Escuela</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Parada</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Horarios</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Credencial</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{e.nombre_completo}</div>
                      <div className="text-xs text-gray-400">{e.matricula} · {e.semestre}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{e.escuela}</td>
                    <td className="px-4 py-3 text-gray-600">{e.paradas?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">Ida: {e.horario_ida ?? '—'}</div>
                      <div className="text-xs text-gray-600">Reg: {e.horario_regreso ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${credencialColor[e.estado_credencial]}`}>
                        {credencialIcon[e.estado_credencial]}
                        {e.estado_credencial}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">No se encontraron estudiantes</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input required value={form.nombre_completo ?? ''} onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Escuela *</label>
                <select required value={form.escuela ?? ''} onChange={e => setForm(f => ({ ...f, escuela: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {ESCUELAS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Matrícula</label>
                <input value={form.matricula ?? ''} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                <input value={form.telefono ?? ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Semestre</label>
                <input value={form.semestre ?? ''} onChange={e => setForm(f => ({ ...f, semestre: e.target.value }))}
                  placeholder="Ej: 3er"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Parada</label>
                <select value={form.parada_id ?? ''} onChange={e => setForm(f => ({ ...f, parada_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Sin asignar</option>
                  {paradas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Horario Ida</label>
                <select value={form.horario_ida ?? ''} onChange={e => setForm(f => ({ ...f, horario_ida: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {HORARIOS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Horario Regreso</label>
                <select value={form.horario_regreso ?? ''} onChange={e => setForm(f => ({ ...f, horario_regreso: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Seleccionar...</option>
                  {HORARIOS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado Credencial</label>
                <select value={form.estado_credencial ?? 'vigente'} onChange={e => setForm(f => ({ ...f, estado_credencial: e.target.value as Estudiante['estado_credencial'] }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="vigente">Vigente</option>
                  <option value="vencida">Vencida</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
                <input type="date" value={form.fecha_vencimiento ?? ''} onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="activo" checked={form.activo ?? true} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="activo" className="text-sm text-gray-700">Estudiante activo</label>
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                  {editing ? 'Guardar Cambios' : 'Crear Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
