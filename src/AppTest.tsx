export default function AppTest() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: '#ef4444',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      margin: 0,
      padding: 0
    }}>
      <h1>React está funcionando! ✓</h1>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>
        Si ves esto en rojo, React se está renderizando correctamente
      </p>
      <button 
        onClick={() => alert('Click funcionando')}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: 'white',
          color: '#ef4444',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Clickea aquí
      </button>
    </div>
  );
}
