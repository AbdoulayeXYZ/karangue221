import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/fleet-dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="AlertTriangle" size={48} className="text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Page Non Trouvée
          </h2>
          <p className="text-text-secondary mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Icon name="Home" size={20} />
            <span>Retour au Tableau de Bord</span>
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 text-text-secondary hover:text-text-primary border border-border rounded-base hover:bg-surface-secondary transition-all duration-150 flex items-center justify-center space-x-2"
          >
            <Icon name="ArrowLeft" size={20} />
            <span>Page Précédente</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;