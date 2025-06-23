import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const currentPath = window.location.pathname;
      
      console.log('🔄 RoleBasedRedirect - Utilisateur:', user);
      console.log('🔄 RoleBasedRedirect - Chemin actuel:', currentPath);
      console.log('🔄 RoleBasedRedirect - Rôle:', user.role);
      
      // Si l'utilisateur est admin et qu'il est sur le dashboard owner
      if (user.role === 'admin' && currentPath === '/fleet-dashboard') {
        console.log('🔀 Redirection admin vers admin-dashboard');
        navigate('/admin-dashboard', { replace: true });
        return;
      }
      
      // Si l'utilisateur est owner et qu'il est sur le dashboard admin
      if (user.role === 'owner' && currentPath === '/admin-dashboard') {
        console.log('🔀 Redirection owner vers fleet-dashboard');
        navigate('/fleet-dashboard', { replace: true });
        return;
      }
      
      // Redirection par défaut lors de la connexion
      if (currentPath === '/' || currentPath === '/login') {
        if (user.role === 'admin') {
          console.log('🔀 Redirection admin par défaut vers admin-dashboard');
          navigate('/admin-dashboard', { replace: true });
        } else {
          console.log('🔀 Redirection owner par défaut vers fleet-dashboard');
          navigate('/fleet-dashboard', { replace: true });
        }
      }
    }
  }, [user, isAuthenticated, loading, navigate]);

  return children;
};

export default RoleBasedRedirect;
