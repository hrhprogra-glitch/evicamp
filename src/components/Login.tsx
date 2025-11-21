import { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // --- CAMBIO REALIZADO AQUÍ: Credenciales actualizadas ---
    if (username === 'admin@gmail.com' && password === '123123') {
      onLoginSuccess('token-acceso-concedido');
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="login-container">
      <video autoPlay loop muted playsInline className="video-bg">
        <source src="/video/gallina.clip.mp4" type="video/mp4" />
      </video>
      <div className="overlay"></div>

      <form onSubmit={handleSubmit} className="login-form">
        
        <div className="logo-container">
            <img src="/img/Logo.evicamp.png" alt="Logo Evicamp" className="form-logo" />
        </div>

        <h2>Bienvenido</h2>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div>
          <label htmlFor="username">Usuario:</label>
          <input 
            id="username"
            type="text" 
            // He añadido un placeholder para recordar el formato
            placeholder="admin@gmail.com"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        
        <div className="password-field">
          <label htmlFor="password">Contraseña:</label>
          <div className="input-wrapper">
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            
            <button 
              type="button" 
              className="icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1} 
              style={{ color: '#000' }}
              title={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="submit-btn">Entrar</button>
      </form>
    </div>
  );
}