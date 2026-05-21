import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Users, MapPin, Clock, Zap } from 'lucide-react';

interface OptimizationRule {
  id: string;
  tipo: 'capacidad' | 'demanda' | 'eficiencia' | 'horario';
  condicion: string;
  accion: string;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'activa' | 'sugerencia' | 'implementada';
  impacto: string;
  fecha_generacion: string;
  fecha_implementacion: string | null;
}

export function Optimization() {
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptimizations();
  }, []);

  const loadOptimizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('optimizaciones')
        .select('*')
        .order('fecha_generacion', { ascending: false });

      if (error) {
        console.error('Error loading optimizations:', error);
        alert('Error al cargar optimizaciones: ' + error.message);
      } else {
        setOptimizationRules(data || []);
      }
    } catch (error) {
      console.error('Error loading optimizations:', error);
      alert('Error al cargar optimizaciones');
    } finally {
      setLoading(false);
    }
  };
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-300';
      case 'media': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'baja': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-blue-100 text-blue-800';
      case 'sugerencia': return 'bg-purple-100 text-purple-800';
      case 'implementada': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'capacidad': return <Users className="w-5 h-5" />;
      case 'demanda': return <MapPin className="w-5 h-5" />;
      case 'eficiencia': return <TrendingUp className="w-5 h-5" />;
      case 'horario': return <Clock className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Módulo de Optimización</h1>
          <p className="text-gray-600 mt-1">Recomendaciones automáticas basadas en datos operativos</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-lg">
          <Lightbulb className="w-5 h-5 text-emerald-700" />
          <span className="text-sm font-medium text-emerald-800">Sistema Inteligente Activo</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Reglas</p>
              <p className="text-3xl font-bold mt-1">{optimizationRules.length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Reglas Activas</p>
              <p className="text-3xl font-bold mt-1">{optimizationRules.filter(r => r.estado === 'activa').length}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Sugerencias</p>
              <p className="text-3xl font-bold mt-1">{optimizationRules.filter(r => r.estado === 'sugerencia').length}</p>
            </div>
            <Lightbulb className="w-10 h-10 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Implementadas</p>
              <p className="text-3xl font-bold mt-1">{optimizationRules.filter(r => r.estado === 'implementada').length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>
      </div>

      {/* Optimization Rules */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6" />
          <span>Reglas de Optimización</span>
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando reglas...</div>
        ) : optimizationRules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay reglas de optimización registradas</div>
        ) : (
          <div className="space-y-4">
            {optimizationRules.map((rule) => (
              <div key={rule.id} className="border border-emerald-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                      {getTypeIcon(rule.tipo)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{rule.tipo.charAt(0).toUpperCase() + rule.tipo.slice(1)}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.estado)}`}>
                          {rule.estado}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.prioridad)}`}>
                        Prioridad: {rule.prioridad}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">SI:</p>
                      <p className="text-sm font-medium text-gray-800 bg-white rounded px-3 py-2 border border-emerald-200">
                        {rule.condicion}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">ENTONCES:</p>
                      <p className="text-sm font-medium text-emerald-700 bg-white rounded px-3 py-2 border border-emerald-200">
                        {rule.accion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Impacto esperado:</span> {rule.impacto}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
          <Lightbulb className="w-6 h-6" />
          <span>Resumen de Optimizaciones</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-gray-800 mb-2">✓ Implementadas</h3>
            <p className="text-2xl font-bold text-green-600">{optimizationRules.filter(r => r.estado === 'implementada').length}</p>
            <p className="text-xs text-gray-600 mt-1">Mejoras aplicadas</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2">→ Activas</h3>
            <p className="text-2xl font-bold text-blue-600">{optimizationRules.filter(r => r.estado === 'activa').length}</p>
            <p className="text-xs text-gray-600 mt-1">En proceso</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-semibold text-gray-800 mb-2">💡 Sugerencias</h3>
            <p className="text-2xl font-bold text-purple-600">{optimizationRules.filter(r => r.estado === 'sugerencia').length}</p>
            <p className="text-xs text-gray-600 mt-1">Por evaluar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
