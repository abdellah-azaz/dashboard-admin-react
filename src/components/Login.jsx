import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const user = response.data.user;
        
        // Restriction Superadmin
        if (user.is_superadmin) {
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/dashboard');
        } else {
          setError('Accès refusé. Seuls les Superadmins peuvent accéder à ce dashboard.');
        }
      } else {
        setError(response.data.message || 'Identifiants invalides');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Connexion</h1>
      <p className="subtitle">Administration AV-Shield & Crypton</p>
      
      <form onSubmit={handleLogin} style={{ width: '100%' }}>
        <div className="input-group">
          <label>Email Professionnel</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />
        </div>
        
        <div className="input-group">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>

        {error && <div className="error-msg">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
