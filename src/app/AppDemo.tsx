import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Users, MapPin, Bus } from 'lucide-react';

export default function AppDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'students' | 'routes' | 'units'>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'operator' | null>(null);

  if (!isLoggedIn) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h1 style={{ color: '#333', marginBottom: '30px' }}>🚌 100EGABUS</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Sistema de Gestión de Transporte Escolar</p>
          
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => { setIsLoggedIn(true); setUserRole('admin'); }}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Ingresar como Admin
            </button>
            <button
              onClick={() => { setIsLoggedIn(true); setUserRole('operator'); }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Ingresar como Operador
            </button>
          </div>
          
          <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
            Demo - Modo sin autenticación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '250px' : '0',
        backgroundColor: '#2c3e50',
        color: 'white',
        overflow: 'hidden',
        transition: 'width 0.3s',
        borderRight: '1px solid #34495e'
      }}>
        <div style={{ padding: '20px' }}>
          <h2 style={{ margin: '0 0 30px 0', fontSize: '18px' }}>100EGABUS</h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setCurrentPage('dashboard')}
              style={{
                padding: '10px',
                backgroundColor: currentPage === 'dashboard' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('students')}
              style={{
                padding: '10px',
                backgroundColor: currentPage === 'students' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Users size={18} /> Estudiantes
            </button>
            <button
              onClick={() => setCurrentPage('routes')}
              style={{
                padding: '10px',
                backgroundColor: currentPage === 'routes' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <MapPin size={18} /> Rutas
            </button>
            <button
              onClick={() => setCurrentPage('units')}
              style={{
                padding: '10px',
                backgroundColor: currentPage === 'units' ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Bus size={18} /> Unidades
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '15px 20px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#333' }}>Usuario Demo ({userRole})</span>
            <button
              onClick={() => { setIsLoggedIn(false); setUserRole(null); }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          {currentPage === 'dashboard' && (
            <div>
              <h1>Dashboard</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Estudiantes</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db', margin: '0' }}>150</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Rutas Activas</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', margin: '0' }}>12</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Unidades</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107', margin: '0' }}>8</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Conductores</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8', margin: '0' }}>10</p>
                </div>
              </div>
            </div>
          )}
          
          {currentPage === 'students' && (
            <div>
              <h1>Estudiantes</h1>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                <p>Listado de estudiantes registrados en el sistema.</p>
                <p style={{ color: '#999', fontSize: '12px' }}>Demo - Los datos reales se cargarán desde la base de datos</p>
              </div>
            </div>
          )}
          
          {currentPage === 'routes' && (
            <div>
              <h1>Rutas</h1>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                <p>Gestión de rutas de transporte.</p>
                <p style={{ color: '#999', fontSize: '12px' }}>Demo - Los datos reales se cargarán desde la base de datos</p>
              </div>
            </div>
          )}
          
          {currentPage === 'units' && (
            <div>
              <h1>Unidades</h1>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                <p>Control de unidades de transporte.</p>
                <p style={{ color: '#999', fontSize: '12px' }}>Demo - Los datos reales se cargarán desde la base de datos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
