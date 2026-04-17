import { useState } from 'react';
import api from '../api/axiosClient';
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
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const user = response.data.user;
        const token = response.data.token;
        
        // Restriction Superadmin
        if (user.is_superadmin) {
          localStorage.setItem('user', JSON.stringify(user));
          if (token) {
            localStorage.setItem('token', token);
          }
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
