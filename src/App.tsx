import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Paradas from './pages/Paradas';
import Rutas from './pages/Rutas';
import Unidades from './pages/Unidades';
import Choferes from './pages/Choferes';
import Viajes from './pages/Viajes';
import Incidencias from './pages/Incidencias';
import Mantenimientos from './pages/Mantenimientos';
import Reportes from './pages/Reportes';
import Optimizacion from './pages/Optimizacion';
import Configuracion from './pages/Configuracion';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { session, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (adminOnly && userRole !== 'administrador') return <Navigate to="/viajes" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="estudiantes" element={<ProtectedRoute adminOnly><Estudiantes /></ProtectedRoute>} />
        <Route path="paradas" element={<ProtectedRoute adminOnly><Paradas /></ProtectedRoute>} />
        <Route path="rutas" element={<Rutas />} />
        <Route path="unidades" element={<Unidades />} />
        <Route path="choferes" element={<ProtectedRoute adminOnly><Choferes /></ProtectedRoute>} />
        <Route path="viajes" element={<Viajes />} />
        <Route path="incidencias" element={<Incidencias />} />
        <Route path="mantenimientos" element={<ProtectedRoute adminOnly><Mantenimientos /></ProtectedRoute>} />
        <Route path="reportes" element={<ProtectedRoute adminOnly><Reportes /></ProtectedRoute>} />
        <Route path="optimizacion" element={<ProtectedRoute adminOnly><Optimizacion /></ProtectedRoute>} />
        <Route path="configuracion" element={<ProtectedRoute adminOnly><Configuracion /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
