export default function AppSimpleTest() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', margin: '0 0 20px 0' }}>✓ 100EGABUS</h1>
        <h2 style={{ color: '#666', fontSize: '18px', fontWeight: 'normal', margin: '0 0 30px 0' }}>App Cargado Correctamente</h2>
        <p style={{ color: '#666', lineHeight: '1.6', margin: '0 0 20px 0' }}>
          La aplicación Electron de gestión de transporte escolar está funcionando.
        </p>
        
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '4px', borderLeft: '4px solid #4caf50' }}>
          <p style={{ color: '#2e7d32', margin: '0', fontSize: '14px' }}>
            ✓ Frontend: React 18.3.1<br/>
            ✓ Framework: Electron 42.1.0<br/>
            ✓ Estado: En ejecución
          </p>
        </div>
        
        <p style={{ color: '#999', fontSize: '12px', marginTop: '20px' }}>
          Versión Demo - Los controles reales se cargarán en breve
        </p>
      </div>
    </div>
  );
}
