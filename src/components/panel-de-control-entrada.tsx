// src/components/panel-de-control-entrada.tsx

interface PanelProps {
  userEmail: string;
  onLogout: () => void;
}

export function PanelDeControlEntrada({ userEmail, onLogout }: PanelProps) {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      color: '#1b4332', 
      background: 'rgba(255,255,255,0.9)', 
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>¡Bienvenido al Sistema!</h1>
      <p>Has ingresado como: <strong>{userEmail}</strong></p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '2rem', 
        border: '1px solid #2e7d32', 
        borderRadius: '10px',
        background: '#e8f5e9',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h3>Panel de Control</h3>
        <p>Aquí irán tus opciones...</p>
      </div>

      <button 
        onClick={onLogout}
        style={{
          marginTop: '30px',
          padding: '10px 25px',
          backgroundColor: '#c62828',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}