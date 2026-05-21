import { FileText, Download, TrendingUp, AlertCircle, CheckCircle, Calendar, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface MonthlyData {
  mes: string;
  usuarios: number;
  viajes: number;
  costo: number;
}

interface RouteData {
  ruta: string;
  eficiencia: number;
  usuarios: number;
  kmRecorrido: number;
}

interface StopData {
  parada: string;
  demanda: number;
  tendencia: string;
}

interface Recommendation {
  tipo: string;
  condicion: string;
  accion: string;
  prioridad: string;
  estado: string;
  impacto: string;
}

export function Reports() {
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [routeEfficiency, setRouteEfficiency] = useState<RouteData[]>([]);
  const [topStops, setTopStops] = useState<StopData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    growth: 0,
    lowestRoute: { name: '', efficiency: 100 },
    topStop: { name: '', trend: 0 }
  });

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      
      // Load viajes for monthly trend and costs
      const { data: viajes } = await supabase.from('viajes').select('*');
      const { data: rutas } = await supabase.from('rutas').select('*');
      const { data: paradas } = await supabase.from('paradas').select('*');
      const { data: optimizaciones } = await supabase.from('optimizaciones').select('*').eq('estado', 'sugerencia');

      // Calculate monthly trend
      if (viajes) {
        const monthMap: { [key: string]: { usuarios: number; viajes: number; costo: number } } = {};
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        viajes.forEach(viaje => {
          const date = new Date(viaje.fecha);
          const monthIndex = date.getMonth();
          const monthName = months[monthIndex];
          
          if (!monthMap[monthName]) {
            monthMap[monthName] = { usuarios: new Set().size, viajes: 0, costo: 0 };
          }
          monthMap[monthName].viajes++;
          monthMap[monthName].costo += (viaje.gasolina_consumida || 0) * 25; // Estimado 25 MXN por litro
        });

        // Calculate unique users per month
        const trendData = months.map(mes => {
          const studentsThisMonth = viajes
            .filter(v => new Date(v.fecha).getMonth() === months.indexOf(mes))
            .filter((v, idx, arr) => arr.findIndex(a => a.estudiante === v.estudiante) === idx).length;
          
          return {
            mes,
            usuarios: studentsThisMonth || monthMap[mes]?.usuarios || 0,
            viajes: monthMap[mes]?.viajes || 0,
            costo: Math.round(monthMap[mes]?.costo || 0)
          };
        }).filter(m => m.viajes > 0);

        setMonthlyTrend(trendData);
      }

      // Calculate route efficiency
      if (rutas) {
        const routeStats = rutas.map(ruta => {
          const rutaViajes = viajes?.filter((v: any) => v.ruta === ruta.nombre) || [];
          const onTimeViajes = rutaViajes.filter((v: any) => (v.retraso || 0) <= 15).length;
          const eficiencia = rutaViajes.length > 0 ? Math.round((onTimeViajes / rutaViajes.length) * 100) : 0;
          
          return {
            ruta: ruta.nombre,
            eficiencia,
            usuarios: rutaViajes.length,
            kmRecorrido: ruta.distancia || 0
          };
        });

        setRouteEfficiency(routeStats);
        
        // Find lowest efficiency route
        const lowestRoute = routeStats.reduce((prev, current) => 
          prev.eficiencia > current.eficiencia ? current : prev
        );
        
        setInsights(prev => ({ ...prev, lowestRoute: { name: lowestRoute.ruta, efficiency: lowestRoute.eficiencia } }));
      }

      // Calculate stop demand
      if (paradas) {
        const stopStats = paradas.map((parada: any) => {
          const paradaViajes = viajes?.filter((v: any) => v.parada_salida === parada.nombre || v.parada_destino === parada.nombre) || [];
          
          return {
            parada: parada.nombre,
            demanda: paradaViajes.length,
            tendencia: '+0%'
          };
        }).sort((a, b) => b.demanda - a.demanda).slice(0, 5);

        setTopStops(stopStats);
        
        if (stopStats.length > 0) {
          setInsights(prev => ({ ...prev, topStop: { name: stopStats[0].parada, trend: 12 } }));
        }
      }

      // Load recommendations
      if (optimizaciones) {
        setRecommendations(optimizaciones);
      }

      // Calculate growth
      if (monthlyTrend.length > 0) {
        const firstMonth = monthlyTrend[0]?.usuarios || 1;
        const lastMonth = monthlyTrend[monthlyTrend.length - 1]?.usuarios || 1;
        const growth = Math.round(((lastMonth - firstMonth) / firstMonth) * 100);
        setInsights(prev => ({ ...prev, growth }));
      }

    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportType: string) => {
    try {
      let csvContent = '';
      let filename = '';

      if (reportType === 'Reporte Mensual') {
        filename = 'reporte_mensual.csv';
        csvContent = 'Mes,Usuarios,Viajes,Costo (MXN)\n' + 
          monthlyTrend.map(m => `${m.mes},${m.usuarios},${m.viajes},${m.costo}`).join('\n');
      } else if (reportType === 'Análisis de Rutas') {
        filename = 'analisis_rutas.csv';
        csvContent = 'Ruta,Eficiencia (%),Usuarios,KM Recorrido\n' + 
          routeEfficiency.map(r => `${r.ruta},${r.eficiencia},${r.usuarios},${r.kmRecorrido}`).join('\n');
      } else if (reportType === 'Reporte de Usuarios') {
        filename = 'reporte_usuarios.csv';
        const { data: usuarios } = await supabase.from('estudiantes').select('*');
        csvContent = 'ID,Nombre,Email,Estado,Fecha_Creacion\n' + 
          (usuarios?.map((u: any) => `${u.id},${u.nombre},${u.email},${u.estado},${u.fecha_creacion}`).join('\n') || '');
      } else if (reportType === 'Costos Operativos') {
        filename = 'costos_operativos.csv';
        csvContent = 'Mes,Costo Total (MXN)\n' + 
          monthlyTrend.map(m => `${m.mes},${m.costo}`).join('\n');
      }

      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error descargando reporte');
    }
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
              <p className="text-sm text-emerald-100">El programa ha crecido un {insights.growth}% en los últimos meses, manteniendo una alta satisfacción.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-8 h-8 text-amber-200 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Oportunidad de Mejora</h3>
              <p className="text-sm text-amber-100">{insights.lowestRoute.name} presenta baja eficiencia ({insights.lowestRoute.efficiency}%). Se recomienda optimizar paradas.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-8 h-8 text-green-200 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Alto Rendimiento</h3>
              <p className="text-sm text-green-100">La parada {insights.topStop.name} presenta la mayor demanda con tendencia creciente.</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Tendencia Mensual */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
            <h2 className="text-xl font-semibold text-emerald-800 mb-4">Tendencia Mensual de Usuarios y Costos</h2>
            {monthlyTrend.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-gray-500">No hay datos disponibles</div>
            )}
          </div>

          {/* Eficiencia de Rutas */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-emerald-100">
            <h2 className="text-xl font-semibold text-emerald-800 mb-4">Eficiencia por Ruta</h2>
            {routeEfficiency.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-gray-500">No hay datos disponibles</div>
            )}
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
                  {topStops.length > 0 ? (
                    topStops.map((stop, index) => (
                      <tr key={stop.parada} className="hover:bg-emerald-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{stop.parada}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{stop.demanda} viajes</td>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
            <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>Recomendaciones Estratégicas (desde Supabase)</span>
            </h2>
            {recommendations.length > 0 ? (
              <ul className="space-y-3">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-800">{rec.condicion}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                          rec.prioridad === 'media' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.prioridad}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{rec.accion}</p>
                      <p className="text-xs text-gray-500 mt-1">Impacto esperado: {rec.impacto}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No hay recomendaciones disponibles. El sistema genera recomendaciones cuando detecta oportunidades de mejora.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
