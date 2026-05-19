import { ClipboardList, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';

export function OperatorWelcome() {
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Panel Operativo 100EGABUS</h1>
        <p className="text-emerald-100 mt-2 capitalize">{today}</p>
        <div className="mt-4 bg-emerald-800 bg-opacity-40 rounded-lg p-4 border border-emerald-200">
          <p className="text-sm font-semibold mb-1 text-white">Tu rol en el sistema:</p>
          <p className="text-emerald-50 text-sm">
            Como operador, eres el puente entre la operación diaria del transporte y el sistema de análisis.
            Los datos que registres alimentarán todos los indicadores, métricas y reportes del sistema.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg p-8 text-white shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-emerald-800 bg-opacity-60 p-4 rounded-lg border-2 border-emerald-300">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Registrar Viaje</h2>
              <p className="text-emerald-50 text-sm">Captura rápida de información operativa</p>
            </div>
          </div>
          <p className="text-emerald-50 mb-4">
            Registra la información de cada viaje realizado: horarios, pasajeros, unidad y consumo de gasolina.
          </p>
          <div className="bg-emerald-800 bg-opacity-40 rounded-lg p-3 text-sm border border-emerald-200">
            <p className="font-medium text-white">Datos a registrar:</p>
            <ul className="mt-2 space-y-1 text-emerald-50">
              <li>• Fecha y horarios</li>
              <li>• Ruta y unidad</li>
              <li>• Chofer y pasajeros</li>
              <li>• Consumo de combustible</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg p-8 text-white shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-orange-800 bg-opacity-60 p-4 rounded-lg border-2 border-orange-200">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Registrar Incidencia</h2>
              <p className="text-amber-50 text-sm">Reporte de eventos operativos</p>
            </div>
          </div>
          <p className="text-amber-50 mb-4">
            Reporta cualquier incidente durante la operación: ponchaduras, fallas mecánicas, retrasos o accidentes.
          </p>
          <div className="bg-orange-800 bg-opacity-40 rounded-lg p-3 text-sm border border-orange-200">
            <p className="font-medium text-white">Tipos de incidencias:</p>
            <ul className="mt-2 space-y-1 text-amber-50">
              <li>• Ponchadura</li>
              <li>• Falla mecánica</li>
              <li>• Retraso / Tráfico</li>
              <li>• Accidente menor</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-700">3</span>
          </div>
          <p className="text-sm text-gray-600">Viajes Registrados Hoy</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-700">0</span>
          </div>
          <p className="text-sm text-gray-600">Incidencias Hoy</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold text-teal-700">18:00</span>
          </div>
          <p className="text-sm text-gray-600">Último Registro</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-700">100%</span>
          </div>
          <p className="text-sm text-gray-600">Tareas Completadas</p>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">Accesos Rápidos</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-medium text-gray-800">Registro de Viajes</p>
                <p className="text-xs text-gray-500">Captura de información operativa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-gray-800">Registro de Incidencias</p>
                <p className="text-xs text-gray-500">Reporte de eventos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">Consultas Disponibles</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">Rutas y Horarios</p>
                <p className="text-xs text-gray-500">Información de rutas activas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-medium text-gray-800">Estado de Unidades</p>
                <p className="text-xs text-gray-500">Disponibilidad de vehículos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsabilidades */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Tus Responsabilidades Principales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">🚍 Operación Diaria</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Registrar salidas y llegadas reales</li>
              <li>• Capturar horarios ejecutados vs programados</li>
              <li>• Documentar unidades y choferes utilizados</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">👥 Demanda Real</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Contar estudiantes por viaje</li>
              <li>• Identificar horarios de saturación</li>
              <li>• Detectar rutas con alta demanda</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">⛽ Consumo de Combustible</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Registrar litros cargados y consumidos</li>
              <li>• Calcular rendimiento por viaje</li>
              <li>• Identificar sobreconsumo anormal</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">🚨 Incidencias</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Reportar fallas mecánicas y ponchaduras</li>
              <li>• Documentar retrasos y causas</li>
              <li>• Registrar costos de reparación</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Impact */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">📊 Impacto de tu Registro</h3>
        <p className="text-gray-700 mb-4">
          Los datos que captures alimentan directamente el sistema de análisis y permiten generar:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-sm font-semibold text-purple-800 mb-1">Métricas de Ocupación</p>
            <p className="text-xs text-gray-600">Usuarios por parada, horarios pico, saturación de unidades</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-sm font-semibold text-purple-800 mb-1">Análisis de Eficiencia</p>
            <p className="text-xs text-gray-600">Puntualidad, consumo por km, eficiencia de rutas</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-sm font-semibold text-purple-800 mb-1">Control de Costos</p>
            <p className="text-xs text-gray-600">Gastos operativos, mantenimiento, combustible</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-sm font-semibold text-purple-800 mb-1">Optimización Logística</p>
            <p className="text-xs text-gray-600">Recomendaciones de rutas, horarios, unidades</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-sm font-semibold text-purple-800 mb-1">Historial de Mantenimiento</p>
            <p className="text-xs text-gray-600">Fallas recurrentes, costos acumulados, planificación</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-sm font-semibold text-purple-800 mb-1">Reportes Ejecutivos</p>
            <p className="text-xs text-gray-600">Información para toma de decisiones administrativas</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-800 mb-3">📋 Flujo de Trabajo Recomendado</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
            <div>
              <p className="font-semibold">Al completar cada viaje</p>
              <p className="text-sm text-gray-600">Registra inmediatamente: horarios reales, pasajeros transportados y combustible consumido</p>
            </div>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
            <div>
              <p className="font-semibold">Ante cualquier incidencia</p>
              <p className="text-sm text-gray-600">Reporta de inmediato: tipo, unidad afectada, descripción detallada y costo estimado</p>
            </div>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
            <div>
              <p className="font-semibold">Para información de rutas y unidades</p>
              <p className="text-sm text-gray-600">Consulta el estado actualizado antes de cada jornada para planificar mejor la operación</p>
            </div>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
            <div>
              <p className="font-semibold">Mantén precisión en los datos</p>
              <p className="text-sm text-gray-600">La calidad de la información que captures define la calidad del análisis y las decisiones administrativas</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg p-6 text-white shadow-lg text-center">
        <h3 className="text-2xl font-bold mb-2">Sin tu registro, el sistema no funciona</h3>
        <p className="text-emerald-100 mb-4">
          Tu labor diaria es fundamental para que el programa 100EGABUS pueda optimizar recursos,
          mejorar el servicio y tomar decisiones basadas en datos reales.
        </p>
        <p className="text-emerald-200 text-sm font-semibold">
          ¡Cada dato que registras es una pieza clave del análisis!
        </p>
      </div>
    </div>
  );
}
