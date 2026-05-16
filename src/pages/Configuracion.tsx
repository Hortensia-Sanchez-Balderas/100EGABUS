import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Usuario } from '../types';
import { Plus, Settings, Users, Shield, Eye, EyeOff } from 'lucide-react';

export default function Configuracion() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'operador' as 'administrador' | 'operador' });
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadUsuarios(); }, []);

  async function loadUsuarios() {
    setLoading(true);
    const { data } = await supabase.from('usuarios').select('*').order('nombre');
    setUsuarios(data ?? []);
    setLoading(false);
  }

  async function handleCreate(ev: React.FormEvent) {
    ev.preventDefault();
    setCreating(true);
    setError('');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nombre: form.nombre, rol: form.rol } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setCreating(false);
      return;
    }
    if (data.user) {
      await supabase.from('usuarios').insert({ nombre: form.nombre, email: form.email, rol: form.rol });
    }
    setShowModal(false);
    setForm({ nombre: '', email: '', password: '', rol: 'operador' });
    loadUsuarios();
    setCreating(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestión de usuarios y parámetros del sistema</p>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg text-green-700"><Settings size={18} /></div>
          <h2 className="font-semibold text-gray-900">Información del Sistema</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sistema', value: '100EGABUS' },
            { label: 'Versión', value: '1.0.0' },
            { label: 'Municipio', value: 'Ciénega de Flores, N.L.' },
            { label: 'Estado', value: 'Operativo' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
              <div className="text-sm font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Parámetros operativos */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg text-green-700"><Settings size={18} /></div>
          <h2 className="font-semibold text-gray-900">Parámetros Operativos</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Capacidad promedio unidad', value: '45 pasajeros' },
            { label: 'Rendimiento flota', value: '3.2 km/L' },
            { label: 'Capacidad tanque', value: '250 litros' },
            { label: 'Meta puntualidad', value: '90%' },
            { label: 'Alerta saturación', value: '> 90% capacidad' },
            { label: 'Alerta mantenimiento km', value: '180,000 km' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
              <div className="text-sm font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gestión de usuarios */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg text-green-700"><Users size={18} /></div>
            <h2 className="font-semibold text-gray-900">Usuarios del Sistema</h2>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> Nuevo Usuario
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Usuario</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Rol</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-xs">
                        {u.nombre.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      u.rol === 'administrador' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Shield size={11} />
                      {u.rol === 'administrador' ? 'Administrador' : 'Operador'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Nuevo Usuario</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña *</label>
                <div className="relative">
                  <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    minLength={6}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value as 'administrador' | 'operador' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="operador">Operador</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setError(''); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  {creating ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Creando...</> : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
