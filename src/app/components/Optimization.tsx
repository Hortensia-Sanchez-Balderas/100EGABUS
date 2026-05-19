import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Users, MapPin, Clock, Zap } from 'lucide-react';

interface OptimizationRule {
  id: string;
  tipo: 'capacidad' | 'demanda' | 'eficiencia' | 'horario';
  condicion: string;
  accion: string;
  prioridad: 'alta' | 'media' | 'baja';
  estado: 'activa' | 'sugerencia' | 'implementada';
  impacto: string;
}

const optimizationRules: OptimizationRule[] = [
  {
    id: '1',
    tipo: 'capacidad',
    condicion: 'Usuarios > Capacidad de unidad',
    accion: 'Recomendar segunda unidad en la misma ruta',
    prioridad: 'alta',
    estado: 'sugerencia',
    impacto: 'Reducir sobrecupo en 35%'
  },
  {
    id: '2',
    tipo: 'demanda',
    condicion: 'Parada < 5 usuarios activos',
    accion: 'Sugerir consolidación de paradas cercanas',
    prioridad: 'media',
    estado: 'activa',
    impacto: 'Optimizar tiempo de recorrido en 12 minutos'
  },
  {
    id: '3',
    tipo: 'eficiencia',
    condicion: 'Retrasos frecuentes (> 3 por semana)',
    accion: 'Ajustar horario de salida +15 minutos',
    prioridad: 'alta',
    estado: 'implementada',
    impacto: 'Mejorar puntualidad en 40%'
  },
  {
    id: '4',
    tipo: 'horario',
    condicion: 'Ocupación matutina > 90%',
    accion: 'Incrementar frecuencia en horario pico',
    prioridad: 'alta',
    estado: 'sugerencia',
    impacto: 'Distribuir demanda y reducir saturación'
  },
  {
    id: '5',
    tipo: 'eficiencia',
    condicion: 'Consumo gasolina > promedio +15%',
    accion: 'Revisar ruta y optimizar paradas',
    prioridad: 'media',
    estado: 'activa',
    impacto: 'Reducir costos operativos en $2,500/mes'
  },
  {
    id: '6',
    tipo: 'capacidad',
    condicion: 'Unidad con ocupación < 40%',
    accion: 'Reasignar a ruta con mayor demanda',
    prioridad: 'baja',
    estado: 'implementada',
    impacto: 'Optimizar uso de recursos'
  },
];

const activeAlerts = [
  {
    id: '1',
    titulo: 'Alta demanda en Parada Universidad',
    descripcion: 'La ocupación ha superado el 95% en horario de 7:00 AM durante los últimos 5 días',
    accion: 'Considerar agregar unidad adicional o ampliar capacidad',
    prioridad: 'alta'
  },
  {
    id: '2',
    titulo: 'Ruta 4 con baja eficiencia',
    descripcion: 'Eficiencia operativa del 68%, por debajo del estándar del 80%',
    accion: 'Revisar distribución de paradas y tiempos de recorrido',
    prioridad: 'media'
  },
  {
    id: '3',
    titulo: 'Parada "Col. Linda Vista" subutilizada',
    descripcion: 'Solo 4 usuarios activos, menor al mínimo recomendado de 8',
    accion: 'Evaluar consolidación con parada "Centro" (distancia: 800m)',
    prioridad: 'baja'
  },
];

const efficiencyMetrics = [
  { nombre: 'Ruta 1', eficiencia: 87, objetivo: 85, estado: 'optimo' },
  { nombre: 'Ruta 2', eficiencia: 82, objetivo: 85, estado: 'aceptable' },
  { nombre: 'Ruta 3', eficiencia: 75, objetivo: 85, estado: 'mejorable' },
  { nombre: 'Ruta 4', eficiencia: 68, objetivo: 85, estado: 'critico' },
];

export function Optimization() {
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

  const getEfficiencyColor = (estado: string) => {
    switch (estado) {
      case 'optimo': return 'text-green-600';
      case 'aceptable': return 'text-emerald-600';
      case 'mejorable': return 'text-amber-600';
      case 'critico': return 'text-red-600';
      default: return 'text-gray-600';
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
              <p className="text-emerald-100 text-sm">Reglas Activas</p>
              <p className="text-3xl font-bold mt-1">{optimizationRules.filter(r => r.estado === 'activa').length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-200" />
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
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Alertas</p>
              <p className="text-3xl font-bold mt-1">{activeAlerts.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6" />
          <span>Alertas Inteligentes</span>
        </h2>
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-4 ${getPriorityColor(alert.prioridad)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{alert.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-2">{alert.descripcion}</p>
                  <div className="bg-white bg-opacity-50 rounded px-3 py-2 text-sm">
                    <span className="font-medium">Acción recomendada: </span>
                    {alert.accion}
                  </div>
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.prioridad)}`}>
                  {alert.prioridad.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Rules */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6" />
          <span>Reglas de Optimización</span>
        </h2>
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
      </div>

      {/* Efficiency Indicators */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6" />
          <span>Indicadores de Eficiencia</span>
        </h2>
        <div className="space-y-4">
          {efficiencyMetrics.map((metric) => (
            <div key={metric.nombre} className="border border-emerald-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{metric.nombre}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getEfficiencyColor(metric.estado)}`}>
                    {metric.eficiencia}%
                  </span>
                  <span className="text-sm text-gray-500">/ {metric.objetivo}%</span>
                </div>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    metric.eficiencia >= metric.objetivo
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : metric.eficiencia >= 75
                      ? 'bg-gradient-to-r from-emerald-500 to-yellow-500'
                      : 'bg-gradient-to-r from-amber-500 to-red-500'
                  }`}
                  style={{ width: `${metric.eficiencia}%` }}
                ></div>
                <div
                  className="absolute top-0 w-1 h-3 bg-gray-800"
                  style={{ left: `${metric.objetivo}%` }}
                  title="Objetivo"
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                <span>Estado: <span className={`font-medium ${getEfficiencyColor(metric.estado)}`}>{metric.estado}</span></span>
                <span>
                  {metric.eficiencia >= metric.objetivo ? '✓ Cumple objetivo' : `⚠ ${metric.objetivo - metric.eficiencia}% por debajo`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
          <Lightbulb className="w-6 h-6" />
          <span>Resumen de Recomendaciones Automáticas</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-gray-800 mb-2">Optimizaciones Implementadas</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Ajuste de horarios para reducir retrasos (+40% puntualidad)</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Reasignación de unidades de baja ocupación</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h3 className="font-semibold text-gray-800 mb-2">Próximas Acciones Sugeridas</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm text-gray-700">
                <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Agregar segunda unidad en ruta con sobrecupo</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-700">
                <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Incrementar frecuencia en horario pico matutino</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
