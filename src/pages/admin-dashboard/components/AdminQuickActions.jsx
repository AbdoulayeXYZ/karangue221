import React from 'react';
import Icon from '../../../components/AppIcon';

const AdminQuickActions = ({ onRefresh }) => {
  const quickActions = [
    {
      title: 'Actualiser Données',
      description: 'Rafraîchir toutes les données du système',
      icon: 'RefreshCw',
      color: 'primary',
      action: onRefresh
    },
    {
      title: 'Sauvegarde BD',
      description: 'Créer une sauvegarde de la base de données',
      icon: 'Download',
      color: 'secondary',
      action: () => alert('Fonctionnalité de sauvegarde à implémenter')
    },
    {
      title: 'Mode Maintenance',
      description: 'Activer/désactiver le mode maintenance',
      icon: 'Settings',
      color: 'warning',
      action: () => alert('Mode maintenance à implémenter')
    },
    {
      title: 'Logs Système',
      description: 'Consulter les logs détaillés',
      icon: 'FileText',
      color: 'info',
      action: () => alert('Consultation des logs à implémenter')
    },
    {
      title: 'Notifications',
      description: 'Envoyer une notification globale',
      icon: 'Bell',
      color: 'success',
      action: () => alert('Notifications globales à implémenter')
    },
    {
      title: 'Rapport Système',
      description: 'Générer un rapport complet du système',
      icon: 'BarChart3',
      color: 'error',
      action: () => alert('Génération de rapport à implémenter')
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'text-primary bg-primary/10 hover:bg-primary/20',
      secondary: 'text-secondary bg-secondary/10 hover:bg-secondary/20',
      success: 'text-success bg-success/10 hover:bg-success/20',
      warning: 'text-warning bg-warning/10 hover:bg-warning/20',
      error: 'text-error bg-error/10 hover:bg-error/20',
      info: 'text-info bg-info/10 hover:bg-info/20'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center space-x-2">
          <Icon name="Zap" size={20} />
          <span>Actions Rapides</span>
        </h3>
        <p className="text-text-secondary text-sm mt-1">
          Accès rapide aux fonctionnalités d'administration les plus utilisées
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded-lg border border-border transition-all duration-200 hover:shadow-md ${getColorClasses(action.color)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getColorClasses(action.color)}`}>
                  <Icon name={action.icon} size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-text-primary mb-1">
                    {action.title}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminQuickActions;
