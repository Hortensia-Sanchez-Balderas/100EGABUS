import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Wrench, Calendar, Plus, Edit2, Trash2, History, DollarSign, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';

interface Mantenimiento {
  id: string;
  unidad_id: string;
  tipo: 'preventivo' | 'correctivo' | 'emergencia';
  fecha_programada: string;
  fecha_realizada: string | null;
  descripcion: string;
  costo: number;
  estado: 'pendiente' | 'completado' | 'cancelado';
  notas: string | null;
  created_at: string;
}

interface Unidad {
  numero: string;
  modelo: string;
}

export function Maintenance() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [filteredMantenimientos, setFilteredMantenimientos] = useState<Mantenimiento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'list' | 'history'>('calendar');
  const [filterUnidad, setFilterUnidad] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  const [formData, setFormData] = useState({
    unidad_id: '',
    tipo: 'preventivo' as 'preventivo' | 'correctivo' | 'emergencia',
    fecha_programada: '',
    fecha_realizada: '',
    descripcion: '',
    costo: 0,
    estado: 'pendiente' as 'pendiente' | 'completado' | 'cancelado',
    notas: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [mantenimientos, filterUnidad, filterEstado]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mantResult, unidadesResult] = await Promise.all([
        supabase.from('mantenimientos').select('*').order('fecha_programada', { ascending: false }),
        supabase.from('unidades').select('numero, modelo').order('numero', { ascending: true }),
      ]);

      if (mantResult.error) {
        console.error('Error loading mantenimientos:', mantResult.error);
        alert('Error al cargar mantenimientos: ' + mantResult.error.message);
      } else {
        setMantenimientos(mantResult.data || []);
      }

      if (unidadesResult.error) {
        console.error('Error loading unidades:', unidadesResult.error);
      } else {
        setUnidades(unidadesResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...mantenimientos];

    if (filterUnidad !== 'all') {
      filtered = filtered.filter((m) => m.unidad_id === filterUnidad);
    }

    if (filterEstado !== 'all') {
      filtered = filtered.filter((m) => m.estado === filterEstado);
    }

    setFilteredMantenimientos(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && currentId) {
        const { error } = await supabase
          .from('mantenimientos')
          .update({
            unidad_id: formData.unidad_id,
            tipo: formData.tipo,
            fecha_programada: formData.fecha_programada,
            fecha_realizada: formData.fecha_realizada || null,
            descripcion: formData.descripcion,
            costo: formData.costo,
            estado: formData.estado,
            notas: formData.notas || null,
          })
          .eq('id', currentId);

        if (error) {
          console.error('Error updating mantenimiento:', error);
          alert('Error al actualizar mantenimiento: ' + error.message);
        } else {
          alert('Mantenimiento actualizado exitosamente');
          closeModal();
          loadData();
        }
      } else {
        const { error } = await supabase.from('mantenimientos').insert({
          unidad_id: formData.unidad_id,
          tipo: formData.tipo,
          fecha_programada: formData.fecha_programada,
          fecha_realizada: formData.fecha_realizada || null,
          descripcion: formData.descripcion,
          costo: formData.costo,
          estado: formData.estado,
          notas: formData.notas || null,
        });

        if (error) {
          console.error('Error creating mantenimiento:', error);
          alert('Error al crear mantenimiento: ' + error.message);
        } else {
          alert('Mantenimiento creado exitosamente');
          closeModal();
          loadData();
        }
      }
    } catch (error) {
      console.error('Error en operación:', error);
      alert('Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mant: Mantenimiento) => {
    setIsEditing(true);
    setCurrentId(mant.id);
    setFormData({
      unidad_id: mant.unidad_id,
      tipo: mant.tipo,
      fecha_programada: mant.fecha_programada,
      fecha_realizada: mant.fecha_realizada || '',
      descripcion: mant.descripcion,
      costo: mant.costo,
      estado: mant.estado,
      notas: mant.notas || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mantenimiento?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('mantenimientos').delete().eq('id', id);

      if (error) {
        console.error('Error deleting mantenimiento:', error);
        alert('Error al eliminar mantenimiento: ' + error.message);
      } else {
        alert('Mantenimiento eliminado exitosamente');
        loadData();
      }
    } catch (error) {
      console.error('Error deleting mantenimiento:', error);
      alert('Error al eliminar mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      unidad_id: '',
      tipo: 'preventivo',
      fecha_programada: '',
      fecha_realizada: '',
      descripcion: '',
      costo: 0,
      estado: 'pendiente',
      notas: '',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="w-4 h-4" />;
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'preventivo':
        return 'text-blue-700 bg-blue-100';
      case 'correctivo':
        return 'text-orange-700 bg-orange-100';
      case 'emergencia':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const pendientes = mantenimientos.filter((m) => m.estado === 'pendiente').length;
  const completados = mantenimientos.filter((m) => m.estado === 'completado').length;
  const costoTotal = mantenimientos
    .filter((m) => m.estado === 'completado')
    .reduce((sum, m) => sum + m.costo, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Gestión de Mantenimiento</h1>
          <p className="text-gray-600 mt-1">Calendario y control de mantenimientos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-md flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Agendar Mantenimiento</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pendientes</p>
              <p className="text-3xl font-bold mt-1">{pendientes}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completados</p>
              <p className="text-3xl font-bold mt-1">{completados}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Unidades</p>
              <p className="text-3xl font-bold mt-1">{unidades.length}</p>
            </div>
            <Wrench className="w-10 h-10 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Costo Total</p>
              <p className="text-3xl font-bold mt-1">${costoTotal.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-200" />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-emerald-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                view === 'calendar'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendario</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                view === 'list'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                view === 'history'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial</span>
            </button>
          </div>

          <div className="flex space-x-3">
            <select
              value={filterUnidad}
              onChange={(e) => setFilterUnidad(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas las unidades</option>
              {unidades.map((u) => (
                <option key={u.numero} value={u.numero}>
                  {u.numero} - {u.modelo}
                </option>
              ))}
            </select>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="completado">Completados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content based on view */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Cargando datos...
        </div>
      ) : view === 'calendar' || view === 'list' ? (
        <div className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Unidad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Descripción</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fecha Programada</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Costo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMantenimientos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No hay mantenimientos registrados
                    </td>
                  </tr>
                ) : (
                  filteredMantenimientos.map((mant) => (
                    <tr key={mant.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{mant.unidad_id}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getTipoColor(mant.tipo)}`}>
                          {mant.tipo.charAt(0).toUpperCase() + mant.tipo.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{mant.descripcion}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(mant.fecha_programada).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                        ${mant.costo.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(mant.estado)}`}>
                          {getEstadoIcon(mant.estado)}
                          <span>{mant.estado.charAt(0).toUpperCase() + mant.estado.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(mant)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mant.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {unidades.map((unidad) => {
            const unidadMants = mantenimientos.filter((m) => m.unidad_id === unidad.numero);
            const totalCosto = unidadMants.reduce((sum, m) => sum + (m.estado === 'completado' ? m.costo : 0), 0);

            return (
              <div key={unidad.numero} className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-800">{unidad.numero} - {unidad.modelo}</h3>
                    <p className="text-sm text-gray-600">Total mantenimientos: {unidadMants.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Costo total</p>
                    <p className="text-2xl font-bold text-emerald-700">${totalCosto.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {unidadMants.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Sin historial de mantenimiento</p>
                  ) : (
                    unidadMants.map((mant) => (
                      <div
                        key={mant.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{mant.descripcion}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(mant.fecha_programada).toLocaleDateString('es-MX')}
                            {mant.fecha_realizada && ` - Realizado: ${new Date(mant.fecha_realizada).toLocaleDateString('es-MX')}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTipoColor(mant.tipo)}`}>
                            {mant.tipo}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(mant.estado)}`}>
                            {mant.estado}
                          </span>
                          <span className="text-sm font-bold text-gray-800">${mant.costo.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold">
                {isEditing ? 'Editar Mantenimiento' : 'Agendar Nuevo Mantenimiento'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
                  <select
                    required
                    value={formData.unidad_id}
                    onChange={(e) => setFormData({ ...formData, unidad_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Seleccionar unidad</option>
                    {unidades.map((u) => (
                      <option key={u.numero} value={u.numero}>
                        {u.numero} - {u.modelo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="emergencia">Emergencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_programada}
                    onChange={(e) => setFormData({ ...formData, fecha_programada: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Realizada</label>
                  <input
                    type="date"
                    value={formData.fecha_realizada}
                    onChange={(e) => setFormData({ ...formData, fecha_realizada: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo (MXN) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Descripción del mantenimiento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  rows={2}
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
