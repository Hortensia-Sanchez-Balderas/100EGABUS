export default function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1>✓ 100EGABUS</h1>
        <p>Aplicación de Gestión de Transporte</p>
        <p style={{ fontSize: '12px', color: '#666' }}>Status: App cargado correctamente</p>
      </div>
    </div>
  );
}
