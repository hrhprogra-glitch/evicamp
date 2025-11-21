import { useState } from 'react';
import './App.css';

// 1. Importamos el componente de Login
import { Login } from './components/Login';

// 2. Importamos tu nuevo Panel de Control
import { PanelDeControlEntrada } from './components/panel-de-control-entrada';

function App() {
  // Estado para el token de autenticación (null = no logueado)
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Estado para guardar el email del usuario
  const [user, setUser] = useState<string>('');

  // Función que se ejecuta cuando el usuario ingresa correctamente
  const handleLoginSuccess = (token: string) => {
    setAuthToken(token);
    setUser('admin@gmail.com'); // Establecemos el usuario fijo por ahora
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setAuthToken(null);
    setUser('');
  };

  // --- RENDERIZADO CONDICIONAL ---

  // A) Si NO hay token, mostramos la pantalla de Login
  if (!authToken) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // B) Si HAY token, mostramos el Panel de Control
  return (
    <PanelDeControlEntrada userEmail={user} onLogout={handleLogout} />
  );
}

export default App;