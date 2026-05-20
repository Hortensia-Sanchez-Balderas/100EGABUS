import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, UserCheck, UserX, GraduationCap, Download, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Student {
  id: string;
  nombre: string;
  escuela: string;
  telefono: string;
  semestre: string;
  estado_credencial: 'vigente' | 'por_vencer' | 'vencida';
  fecha_vencimiento: string;
  parada_asignada: string;
  horario_ida: string;
  horario_regreso: string;
  estado: 'activo' | 'inactivo';
  fecha_registro: string;
}

interface Stop {
  id: string;
  nombre: string;
  ubicacion: string;
  coordenadas: string;
  ruta: string;
  capacidad: number;
  estado: 'activa' | 'inactiva';
}

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [filterCredencial, setFilterCredencial] = useState<string>('todas');

  const [formData, setFormData] = useState({
    nombre: '',
    escuela: '',
    telefono: '',
    semestre: '',
    fecha_vencimiento: '',
    parada_asignada: '',
    horario_ida: '',
    horario_regreso: '',
  });

  useEffect(() => {
    loadStudents();
    loadStops();
  }, []);

  const loadStops = async () => {
    try {
      const { data, error } = await supabase
        .from('paradas')
        .select('*')
        .eq('estado', 'activa')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error loading stops:', error);
      } else {
        setStops(data || []);
      }
    } catch (error) {
      console.error('Error loading stops:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .order('fecha_registro', { ascending: false });

      if (error) {
        console.error('Error loading students:', error);
        alert('Error al cargar estudiantes: ' + error.message);
      } else {
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.escuela.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.telefono && student.telefono.includes(searchTerm));

    const matchesFilter =
      filterCredencial === 'todas' || student.estado_credencial === filterCredencial;

    return matchesSearch && matchesFilter;
  });

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      nombre: '',
      escuela: '',
      telefono: '',
      semestre: '',
      fecha_vencimiento: '',
      parada_asignada: '',
      horario_ida: '',
      horario_regreso: '',
    });
    loadStops(); // Recargar paradas cuando se abre el modal
    setShowModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nombre: student.nombre,
      escuela: student.escuela,
      telefono: student.telefono || '',
      semestre: student.semestre || '',
      fecha_vencimiento: student.fecha_vencimiento || '',
      parada_asignada: student.parada_asignada || '',
      horario_ida: student.horario_ida || '',
      horario_regreso: student.horario_regreso || '',
    });
    loadStops(); // Recargar paradas cuando se abre el modal
    setShowModal(true);
  };

  const handleSaveStudent = async () => {
    if (!formData.nombre || !formData.escuela) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      // Calcular estado de credencial
      const today = new Date();
      const vencimiento = new Date(formData.fecha_vencimiento);
      const diasParaVencer = Math.ceil((vencimiento.getTime() - today.getTime()) / (1000 * 3600 * 24));

      let estado_credencial: 'vigente' | 'por_vencer' | 'vencida' = 'vigente';
      if (diasParaVencer < 0) {
        estado_credencial = 'vencida';
      } else if (diasParaVencer <= 30) {
        estado_credencial = 'por_vencer';
      }

      const studentData = {
        ...formData,
        estado_credencial,
        estado: editingStudent ? editingStudent.estado : 'activo',
      };

      if (editingStudent) {
        // Actualizar estudiante existente
        const { error } = await supabase
          .from('estudiantes')
          .update(studentData)
          .eq('id', editingStudent.id);

        if (error) {
          console.error('Error updating student:', error);
          alert('Error al actualizar estudiante: ' + error.message);
        } else {
          alert('Estudiante actualizado exitosamente');
          setShowModal(false);
          loadStudents();
        }
      } else {
        // Crear nuevo estudiante
        const { error } = await supabase
          .from('estudiantes')
          .insert([studentData]);

        if (error) {
          console.error('Error creating student:', error);
          alert('Error al crear estudiante: ' + error.message);
        } else {
          alert('Estudiante creado exitosamente');
          setShowModal(false);
          loadStudents();
        }
      }
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error al guardar estudiante');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este estudiante?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('estudiantes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        alert('Error al eliminar estudiante: ' + error.message);
      } else {
        alert('Estudiante eliminado exitosamente');
        loadStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error al eliminar estudiante');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';

    setLoading(true);
    try {
      const { error } = await supabase
        .from('estudiantes')
        .update({ estado: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        alert('Error al cambiar estado: ' + error.message);
      } else {
        loadStudents();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: string) => {
    alert(`Exportando datos en formato ${type.toUpperCase()}...`);
  };

  const activeStudents = students.filter((s) => s.estado === 'activo').length;
  const credencialesVigentes = students.filter((s) => s.estado_credencial === 'vigente').length;
  const credencialesPorVencer = students.filter((s) => s.estado_credencial === 'por_vencer').length;

  const getCredencialColor = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'bg-green-100 text-green-800';
      case 'por_vencer':
        return 'bg-amber-100 text-amber-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCredencialLabel = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'Vigente';
      case 'por_vencer':
        return 'Por Vencer';
      case 'vencida':
        return 'Vencida';
      default:
        return estado;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Gestión de Estudiantes</h1>
        <button
          onClick={handleAddStudent}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Estudiante</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Estudiantes</p>
              <p className="text-3xl font-bold mt-1">{students.length}</p>
            </div>
            <GraduationCap className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Estudiantes Activos</p>
              <p className="text-3xl font-bold mt-1">{activeStudents}</p>
            </div>
            <UserCheck className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Credenciales Vigentes</p>
              <p className="text-3xl font-bold mt-1">{credencialesVigentes}</p>
            </div>
            <UserCheck className="w-10 h-10 text-teal-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Por Vencer</p>
              <p className="text-3xl font-bold mt-1">{credencialesPorVencer}</p>
            </div>
            <UserX className="w-10 h-10 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-emerald-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, escuela o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterCredencial}
              onChange={(e) => setFilterCredencial(e.target.value)}
              className="px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todas">Todas las credenciales</option>
              <option value="vigente">Vigentes</option>
              <option value="por_vencer">Por Vencer</option>
              <option value="vencida">Vencidas</option>
            </select>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50 border-b border-emerald-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Escuela</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Teléfono</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Semestre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Credencial</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Vencimiento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Parada</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Horarios</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {loading && students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    Cargando estudiantes...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterCredencial !== 'todas'
                      ? 'No se encontraron estudiantes con ese criterio'
                      : 'No hay estudiantes registrados. Haz clic en "Agregar Estudiante" para comenzar.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{student.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.escuela}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.telefono || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.semestre || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCredencialColor(student.estado_credencial)}`}>
                        {getCredencialLabel(student.estado_credencial)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.fecha_vencimiento ? new Date(student.fecha_vencimiento).toLocaleDateString('es-MX') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.parada_asignada || '-'}</td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div>Ida: {student.horario_ida || '-'}</div>
                      <div>Reg: {student.horario_regreso || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(student.id, student.estado)}
                        disabled={loading}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        } disabled:opacity-50`}
                      >
                        {student.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          disabled={loading}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-emerald-800 mb-6">
              {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Escuela *</label>
                <select
                  value={formData.escuela}
                  onChange={(e) => setFormData({ ...formData, escuela: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="UANL - Facultad de Ingeniería">UANL - Facultad de Ingeniería</option>
                  <option value="UANL - Facultad de Derecho">UANL - Facultad de Derecho</option>
                  <option value="UANL - Facultad de Medicina">UANL - Facultad de Medicina</option>
                  <option value="UDEM">UDEM</option>
                  <option value="CBTIS 103">CBTIS 103</option>
                  <option value="Preparatoria 1">Preparatoria 1</option>
                  <option value="TEC">TEC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="811-234-5678"
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                <select
                  value={formData.semestre}
                  onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="1ro">1ro</option>
                  <option value="2do">2do</option>
                  <option value="3ro">3ro</option>
                  <option value="4to">4to</option>
                  <option value="5to">5to</option>
                  <option value="6to">6to</option>
                  <option value="7mo">7mo</option>
                  <option value="8vo">8vo</option>
                  <option value="9no">9no</option>
                  <option value="10mo">10mo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento Credencial</label>
                <input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parada Asignada</label>
                <select
                  value={formData.parada_asignada}
                  onChange={(e) => setFormData({ ...formData, parada_asignada: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar...</option>
                  {stops.map((stop) => (
                    <option key={stop.id} value={stop.nombre}>
                      {stop.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horario de Ida</label>
                <select
                  value={formData.horario_ida}
                  onChange={(e) => setFormData({ ...formData, horario_ida: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="5:00 AM">5:00 AM</option>
                  <option value="6:00 AM">6:00 AM</option>
                  <option value="7:00 AM">7:00 AM</option>
                  <option value="13:00 PM">13:00 PM</option>
                  <option value="14:00 PM">14:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horario de Regreso</label>
                <select
                  value={formData.horario_regreso}
                  onChange={(e) => setFormData({ ...formData, horario_regreso: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="13:00 PM">13:00 PM</option>
                  <option value="14:00 PM">14:00 PM</option>
                  <option value="18:00 PM">18:00 PM</option>
                  <option value="19:00 PM">19:00 PM</option>
                  <option value="21:00 PM">21:00 PM</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveStudent}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
