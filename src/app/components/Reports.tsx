import { FileText, Download, TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const monthlyTrend = [
  { mes: 'Ene', usuarios: 980, viajes: 4200, costo: 38000 },
  { mes: 'Feb', usuarios: 1050, viajes: 4500, costo: 39500 },
  { mes: 'Mar', usuarios: 1120, viajes: 4800, costo: 41000 },
  { mes: 'Abr', usuarios: 1180, viajes: 5100, costo: 43500 },
  { mes: 'May', usuarios: 1247, viajes: 5400, costo: 45000 },
];

const routeEfficiency = [
  { ruta: 'Ruta 1', eficiencia: 87, usuarios: 420, kmRecorrido: 45 },
  { ruta: 'Ruta 2', eficiencia: 82, usuarios: 350, kmRecorrido: 38 },
  { ruta: 'Ruta 3', eficiencia: 75, usuarios: 280, kmRecorrido: 42 },
  { ruta: 'Ruta 4', eficiencia: 68, usuarios: 197, kmRecorrido: 35 },
];

const topStops = [
  { parada: 'Universidad', demanda: 78, tendencia: '+12%' },
  { parada: 'CBTIS', demanda: 62, tendencia: '+8%' },
  { parada: 'Preparatoria', demanda: 55, tendencia: '+5%' },
  { parada: 'Centro', demanda: 45, tendencia: '-2%' },
  { parada: 'Col. Linda Vista', demanda: 41, tendencia: '+3%' },
];

export function Reports() {
  const handleDownloadReport = (reportType: string) => {
    alert(`Descargando reporte: ${reportType}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Reportes y Análisis</h1>
        <div className="flex items-center space-x-2 text-sm text-emerald-600">
          <Calendar className="w-4 h-4" />
          <span>Periodo: Mayo 2026</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => handleDownloadReport('Reporte Mensual')}
          className="bg-white border-2 border-emerald-500 hover:bg-emerald-50 p-6 rounded-lg shadow-md transition-colors group"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <FileText className="w-10 h-10 text-emerald-600" />
            <span className="font-medium text-emerald-800">Reporte Mensual</span>
            <Download className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => handleDownloadReport('Análisis de Rutas')}
          className="bg-white border-2 border-green-500 hover:bg-green-50 p-6 rounded-lg shadow-md transition-colors group"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <TrendingUp className="w-10 h-10 text-green-600" />
            <span className="font-medium text-green-800">Análisis de Rutas</span>
            <Download className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => handleDownloadReport('Reporte de Usuarios')}
          className="bg-white border-2 border-teal-500 hover:bg-teal-50 p-6 rounded-lg shadow-md transition-colors group"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <FileText className="w-10 h-10 text-teal-600" />
            <span className="font-medium text-teal-800">Reporte de Usuarios</span>
            <Download className="w-4 h-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => handleDownloadReport('Costos Operativos')}
          className="bg-white border-2 border-lime-600 hover:bg-lime-50 p-6 rounded-lg shadow-md transition-colors group"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <FileText className="w-10 h-10 text-lime-700" />
            <span className="font-medium text-lime-800">Costos Operativos</span>
            <Download className="w-4 h-4 text-lime-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-8 h-8 text-emerald-200 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Crecimiento Sostenido</h3>
              <p className="text-sm text-emerald-100">El programa ha crecido un 27% en los últimos 5 meses, manteniendo una alta satisfacción.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-8 h-8 text-amber-200 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Oportunidad de Mejora</h3>
              <p className="text-sm text-amber-100">La Ruta 4 presenta baja eficiencia (68%). Se recomienda optimizar paradas.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-8 h-8 text-green-200 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Alto Rendimiento</h3>
              <p className="text-sm text-green-100">La parada Universidad presenta la mayor demanda con tendencia creciente del 12%.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tendencia Mensual */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4">Tendencia Mensual de Usuarios y Costos</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
            <XAxis dataKey="mes" stroke="#065f46" />
            <YAxis yAxisId="left" stroke="#065f46" />
            <YAxis yAxisId="right" orientation="right" stroke="#065f46" />
            <Tooltip
              contentStyle={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981' }}
              labelStyle={{ color: '#065f46' }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="usuarios" stroke="#10b981" strokeWidth={3} name="Usuarios" />
            <Line yAxisId="right" type="monotone" dataKey="costo" stroke="#f59e0b" strokeWidth={3} name="Costo (MXN)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Eficiencia de Rutas */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4">Eficiencia por Ruta</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={routeEfficiency}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
            <XAxis dataKey="ruta" stroke="#065f46" />
            <YAxis stroke="#065f46" />
            <Tooltip
              contentStyle={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981' }}
              labelStyle={{ color: '#065f46' }}
            />
            <Bar dataKey="eficiencia" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Paradas */}
      <div className="bg-white rounded-lg shadow-md border border-emerald-100 overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200">
          <h2 className="text-xl font-semibold text-emerald-800">Top 5 Paradas por Demanda</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-50 border-b border-emerald-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Posición</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Parada</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Usuarios Activos</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Tendencia</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {topStops.map((stop, index) => (
                <tr key={stop.parada} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{stop.parada}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{stop.demanda} estudiantes</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      stop.tendencia.startsWith('+')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stop.tendencia}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">Óptima</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
        <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
          <FileText className="w-6 h-6" />
          <span>Recomendaciones Estratégicas</span>
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Incrementar frecuencia en la Ruta 2 durante horas pico (7:00 AM) debido a alta demanda en parada Universidad.</span>
          </li>
          <li className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Evaluar reestructuración de la Ruta 4 para mejorar eficiencia operativa, actualmente en 68%.</span>
          </li>
          <li className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Considerar apertura de nueva parada cerca de zona universitaria dado el crecimiento del 12% mensual.</span>
          </li>
          <li className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Implementar sistema de registro digital para reducir tiempos de abordaje y mejorar puntualidad.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
