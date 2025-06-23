import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const API_URL = 'http://localhost:5001/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
      
      // Stocker les données d'authentification
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Redirection basée sur le rôle
      console.log('Utilisateur connecté:', data.user);
      console.log('Rôle utilisateur:', data.user.role);
      
      if (data.user.role === 'admin') {
        console.log('Redirection admin vers admin-dashboard');
        navigate('/admin-dashboard');
      } else if (data.user.role === 'owner') {
        console.log('Redirection owner vers fleet-dashboard');
        navigate('/fleet-dashboard');
      } else {
        // Pour les autres rôles, rediriger vers le dashboard par défaut
        console.log('Redirection par défaut vers fleet-dashboard');
        navigate('/fleet-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Icon name="Lock" size={40} className="text-blue-600 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
          <p className="text-gray-500 text-sm">Accédez à votre espace Karangue221</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              className="input-field w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Icon name="Loader" className="animate-spin" size={18} />} Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 