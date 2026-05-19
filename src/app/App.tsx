import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MapPin, FileText, Menu, X, Bus, Route, Wrench, UserCircle, ClipboardList, AlertTriangle, Zap, LogOut, Clock, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Stops } from './components/Stops';
import { Routes } from './components/Routes';
import { Units } from './components/Units';
import { Drivers } from './components/Drivers';
import { Trips } from './components/Trips';
import { Incidents } from './components/Incidents';
import { Reports } from './components/Reports';
import { Optimization } from './components/Optimization';
import { Users as UsersManagement } from './components/Users';
import { OperatorWelcome } from './components/operator/OperatorWelcome';
import { OperatorTrips } from './components/operator/OperatorTrips';
import { OperatorIncidents } from './components/operator/OperatorIncidents';
import { OperatorRoutes } from './components/operator/OperatorRoutes';
import { OperatorUnits } from './components/operator/OperatorUnits';

type AdminView = 'dashboard' | 'students' | 'stops' | 'routes' | 'units' | 'drivers' | 'trips' | 'incidents' | 'reports' | 'optimization' | 'users';
type OperatorView = 'welcome' | 'trips' | 'incidents' | 'routes' | 'units';
type UserRole = 'admin' | 'operator' | null;

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [operatorView, setOperatorView] = useState<OperatorView>('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al cargar la app
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setLoading(false);
        return;
      }

      // Obtener información del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!userError && userData && userData.activo) {
        const role = userData.rol === 'admin' ? 'admin' : 'operator';
        setUserRole(role);
        setUserId(userData.id);
        setUserName(userData.nombre_completo);

        if (role === 'operator') {
          setOperatorView('welcome');
        } else {
          setAdminView('dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (role: 'admin' | 'operator', id: string, name: string) => {
    setUserRole(role);
    setUserId(id);
    setUserName(name);
    if (role === 'operator') {
      setOperatorView('welcome');
    } else {
      setAdminView('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUserRole(null);
    setUserId('');
    setUserName('');
    setAdminView('dashboard');
    setOperatorView('welcome');
  };

  const renderAdminView = () => {
    switch (adminView) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'stops':
        return <Stops />;
      case 'routes':
        return <Routes />;
      case 'units':
        return <Units />;
      case 'drivers':
        return <Drivers />;
      case 'trips':
        return <Trips />;
      case 'incidents':
        return <Incidents />;
      case 'reports':
        return <Reports />;
      case 'optimization':
        return <Optimization />;
      case 'users':
        return <UsersManagement />;
      default:
        return <Dashboard />;
    }
  };

  const renderOperatorView = () => {
    switch (operatorView) {
      case 'welcome':
        return <OperatorWelcome />;
      case 'trips':
        return <OperatorTrips />;
      case 'incidents':
        return <OperatorIncidents />;
      case 'routes':
        return <OperatorRoutes />;
      case 'units':
        return <OperatorUnits />;
      default:
        return <OperatorWelcome />;
    }
  };

  const adminMenuItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as AdminView, label: 'Estudiantes', icon: Users },
    { id: 'stops' as AdminView, label: 'Paradas', icon: MapPin },
    { id: 'routes' as AdminView, label: 'Rutas', icon: Route },
    { id: 'units' as AdminView, label: 'Unidades', icon: Bus },
    { id: 'drivers' as AdminView, label: 'Choferes', icon: UserCircle },
    { id: 'trips' as AdminView, label: 'Viajes', icon: ClipboardList },
    { id: 'incidents' as AdminView, label: 'Incidencias', icon: AlertTriangle },
    { id: 'reports' as AdminView, label: 'Reportes', icon: FileText },
    { id: 'optimization' as AdminView, label: 'Optimización', icon: Zap },
    { id: 'users' as AdminView, label: 'Usuarios', icon: Shield },
  ];

  const operatorMenuItems = [
    { id: 'welcome' as OperatorView, label: 'Inicio', icon: LayoutDashboard },
    { id: 'trips' as OperatorView, label: 'Registro de Viajes', icon: ClipboardList },
    { id: 'incidents' as OperatorView, label: 'Registro de Incidencias', icon: AlertTriangle },
    { id: 'routes' as OperatorView, label: 'Consulta de Rutas', icon: Route },
    { id: 'units' as OperatorView, label: 'Consulta de Unidades', icon: Bus },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : operatorMenuItems;
  const currentView = userRole === 'admin' ? adminView : operatorView;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Bus className="w-16 h-16 text-emerald-600 animate-pulse mx-auto mb-4" />
          <p className="text-emerald-700 text-lg font-semibold">Cargando 100EGABUS...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen ${
      userRole === 'admin'
        ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
        : 'bg-gray-100'
    }`}>
      {/* Header */}
      <header className={`text-white shadow-lg sticky top-0 z-40 ${
        userRole === 'admin'
          ? 'bg-gradient-to-r from-emerald-600 to-green-600'
          : 'bg-gray-800'
      }`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors lg:hidden ${
                userRole === 'admin' ? 'hover:bg-emerald-700' : 'hover:bg-gray-700'
              }`}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Bus className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">100EGABUS</h1>
              <p className={`text-xs ${userRole === 'admin' ? 'text-emerald-100' : 'text-gray-400'}`}>
                {userRole === 'admin' ? 'Sistema de Gestión de Transporte' : 'Panel Operativo - Captura de Datos'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              userRole === 'admin' ? 'bg-emerald-700' : 'bg-gray-700'
            }`}>
              <UserCircle className="w-5 h-5" />
              <div className="text-left">
                <p className="text-xs opacity-75">{userRole === 'admin' ? 'Administrador' : 'Operador'}</p>
                <p className="text-sm font-semibold">{userName}</p>
              </div>
            </div>
            {userRole === 'admin' && (
              <div className="hidden md:flex items-center space-x-2 bg-emerald-700 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm">Sistema Activo</span>
              </div>
            )}
            {userRole === 'operator' && (
              <div className="hidden md:flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm">{new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                userRole === 'admin'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] bg-white shadow-xl transition-transform duration-300 ease-in-out z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } w-64 flex flex-col`}
        >
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (userRole === 'admin') {
                      setAdminView(item.id as AdminView);
                    } else {
                      setOperatorView(item.id as OperatorView);
                    }
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className={`p-4 border-t ${
            userRole === 'admin'
              ? 'border-emerald-100 bg-emerald-50'
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="text-center">
              <p className={`text-sm font-medium ${
                userRole === 'admin' ? 'text-emerald-800' : 'text-gray-700'
              }`}>
                {userRole === 'admin' ? 'Panel Administrativo' : 'Consola Operativa'}
              </p>
              <p className={`text-xs mt-1 ${
                userRole === 'admin' ? 'text-emerald-600' : 'text-gray-500'
              }`}>
                Ciénega de Flores, N.L.
              </p>
              {userRole === 'operator' && (
                <p className="text-xs text-gray-400 mt-2 italic">
                  Captura de datos operativos
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {userRole === 'admin' ? renderAdminView() : renderOperatorView()}
          </div>
        </main>
      </div>
    </div>
  );
}
