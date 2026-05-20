import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Users as UsersIcon, Edit2, Trash2, Lock, CheckCircle, XCircle, Search } from 'lucide-react';


interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: 'admin' | 'operador';
  activo: boolean;
  fecha_creacion: string;
  ultimo_acceso: string | null;
}

export function Users() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    nombre_completo: '',
    password: '',
    rol: 'operador' as 'admin' | 'operador',
    activo: true,
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error loading usuarios:', error);
        alert('Error al cargar usuarios: ' + error.message);
      } else {
        setUsuarios(data || []);
      }
    } catch (error) {
      console.error('Error loading usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && currentUserId) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from('usuarios')
          .update({
            nombre_completo: formData.nombre_completo,
            rol: formData.rol,
            activo: formData.activo,
          })
          .eq('id', currentUserId);

        if (error) {
          console.error('Error updating usuario:', error);
          alert('Error al actualizar usuario: ' + error.message);
        } else {
          alert('Usuario actualizado exitosamente');
          closeModal();
          loadUsuarios();
        }
      } else {
        // Crear nuevo usuario
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-51f7d672/create-user`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              nombre_completo: formData.nombre_completo,
              rol: formData.rol,
              activo: formData.activo,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error creating user:', errorData);
          alert('Error al crear usuario: ' + errorData);
        } else {
          const result = await response.json();
          alert('Usuario creado exitosamente');
          closeModal();
          loadUsuarios();
        }
      }
    } catch (error) {
      console.error('Error en operación de usuario:', error);
      alert('Error en la operación: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setIsEditing(true);
    setCurrentUserId(usuario.id);
    setFormData({
      email: usuario.email,
      nombre_completo: usuario.nombre_completo,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);

      if (error) {
        console.error('Error deleting usuario:', error);
        alert('Error al eliminar usuario: ' + error.message);
      } else {
        alert('Usuario eliminado exitosamente');
        loadUsuarios();
      }
    } catch (error) {
      console.error('Error deleting usuario:', error);
      alert('Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentUserId(null);
    setFormData({
      email: '',
      nombre_completo: '',
      password: '',
      rol: 'operador',
      activo: true,
    });
  };

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.activo).length;
  const admins = usuarios.filter((u) => u.rol === 'admin').length;
  const operadores = usuarios.filter((u) => u.rol === 'operador').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administración de cuentas del sistema</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-md flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Crear Usuario</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Usuarios</p>
              <p className="text-3xl font-bold mt-1">{totalUsuarios}</p>
            </div>
            <UsersIcon className="w-10 h-10 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Usuarios Activos</p>
              <p className="text-3xl font-bold mt-1">{usuariosActivos}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Administradores</p>
              <p className="text-3xl font-bold mt-1">{admins}</p>
            </div>
            <Lock className="w-10 h-10 text-teal-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Operadores</p>
              <p className="text-3xl font-bold mt-1">{operadores}</p>
            </div>
            <UsersIcon className="w-10 h-10 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-emerald-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nombre Completo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Fecha Creación</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Último Acceso</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{usuario.nombre_completo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usuario.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          usuario.rol === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {usuario.rol === 'admin' ? 'Administrador' : 'Operador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {usuario.activo ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactivo</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(usuario.fecha_creacion).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {usuario.ultimo_acceso
                        ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-MX')
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold">
                {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Juan Pérez García"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  disabled={isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="usuario@ejemplo.com"
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">El email no puede modificarse</p>
                )}
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  required
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'admin' | 'operador' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.rol === 'admin'
                    ? 'Acceso completo al sistema'
                    : 'Solo registro de viajes e incidencias'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                  Usuario activo
                </label>
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
                  {loading ? 'Procesando...' : isEditing ? 'Actualizar' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
