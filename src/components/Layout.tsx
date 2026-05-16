import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, LayoutDashboard, Users, MapPin, Route, Truck, CircleUser as UserCircle, Navigation, AlertTriangle, BarChart3, Zap, Settings, LogOut, Menu, X, ChevronRight, Wrench } from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', adminOnly: true },
  { to: '/estudiantes', icon: <Users size={18} />, label: 'Estudiantes', adminOnly: true },
  { to: '/paradas', icon: <MapPin size={18} />, label: 'Paradas', adminOnly: true },
  { to: '/rutas', icon: <Route size={18} />, label: 'Rutas' },
  { to: '/unidades', icon: <Truck size={18} />, label: 'Unidades' },
  { to: '/choferes', icon: <UserCircle size={18} />, label: 'Choferes', adminOnly: true },
  { to: '/viajes', icon: <Navigation size={18} />, label: 'Viajes' },
  { to: '/incidencias', icon: <AlertTriangle size={18} />, label: 'Incidencias' },
  { to: '/mantenimientos', icon: <Wrench size={18} />, label: 'Mantenimientos', adminOnly: true },
  { to: '/reportes', icon: <BarChart3 size={18} />, label: 'Reportes', adminOnly: true },
  { to: '/optimizacion', icon: <Zap size={18} />, label: 'Optimización', adminOnly: true },
  { to: '/configuracion', icon: <Settings size={18} />, label: 'Configuración', adminOnly: true },
];

export default function Layout() {
  const { userRole, userName, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = navItems.filter(item => !item.adminOnly || userRole === 'administrador');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-green-950 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-green-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg flex-shrink-0">
              <Bus className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">100EGABUS</h1>
              <p className="text-green-400 text-[10px] mt-0.5 leading-none">Gestión de Transporte</p>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-green-800/30">
          <div className={`text-xs font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${
            userRole === 'administrador'
              ? 'bg-green-500/20 text-green-300'
              : 'bg-gray-700/50 text-gray-400'
          }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {userRole === 'administrador' ? 'Administrador' : 'Operador'}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {visibleItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-green-300 hover:bg-green-800/60 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-white' : 'text-green-400 group-hover:text-white'}>
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-green-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              <p className="text-green-500 text-xs">Sesión activa</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-green-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all text-sm"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Sistema operativo
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
