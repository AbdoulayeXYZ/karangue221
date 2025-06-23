import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../hooks/useAdminData';
import AdminHeader from '../../components/ui/AdminHeader';
import SystemStatusIndicator from '../../components/ui/SystemStatusIndicator';
import Icon from '../../components/AppIcon';
import AdminStatsCards from './components/AdminStatsCards';
import SystemOverview from './components/SystemOverview';
import UserManagement from './components/UserManagement';
import SystemActivity from './components/SystemActivity';
import PerformanceMetrics from './components/PerformanceMetrics';
import SystemHealth from './components/SystemHealth';
import AdminQuickActions from './components/AdminQuickActions';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Récupération des données admin avec rafraîchissement auto
  const {
    data,
    loading,
    errors,
    lastUpdated,
    refreshAll,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    isLoading,
    hasErrors
  } = useAdminData({
    autoRefresh: true,
    refreshInterval: 30000, // 30 secondes
    initialLoad: true
  });

  // Vérifier les privilèges administrateur
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Icon name="ShieldAlert" size={64} className="text-warning mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Accès Refusé
          </h1>
          <p className="text-text-secondary">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  const handleRefreshData = useCallback(() => {
    console.log('🔄 Rafraîchissement manuel des données admin');
    refreshAll();
  }, [refreshAll]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Charger les données spécifiques à l'onglet si nécessaire
    if (tab === 'users' && (!data.users || data.users.length === 0)) {
      loadUsers();
    }
  };

  const tabs = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { key: 'users', label: 'Utilisateurs', icon: 'Users' },
    { key: 'performance', label: 'Performance', icon: 'Activity' },
    { key: 'system', label: 'Système', icon: 'Settings' },
    { key: 'logs', label: 'Logs', icon: 'FileText' }
  ];

  const getConnectionStatus = () => {
    if (hasErrors) return 'error';
    if (isLoading) return 'connecting';
    
    // Utiliser les nouvelles données de santé d'abord
    if (data.health?.status) {
      switch (data.health.status) {
        case 'healthy': return 'connected';
        case 'warning': return 'connecting';
        case 'critical': return 'error';
        default: return 'disconnected';
      }
    }
    
    // Fallback vers les anciennes données
    return data.health?.data?.status === 'healthy' ? 'connected' : 'disconnected';
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="pt-16"> {/* Compensation pour le header fixe */}
        <div className="px-4 lg:px-6 py-6">
        
        {/* Header du tableau de bord admin */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              Administration Système
            </h1>
            <p className="text-text-secondary">
              Gestion et surveillance complète de la plateforme Karangue221
            </p>
            <div className="mt-2 text-sm text-text-secondary">
              Connecté en tant que: <span className="font-medium text-primary">{user.name}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <SystemStatusIndicator 
              status={getConnectionStatus()}
              statusText={
                getConnectionStatus() === 'connected' ? 'Système opérationnel' :
                getConnectionStatus() === 'connecting' ? 'Vérification...' :
                getConnectionStatus() === 'disconnected' ? 'Système hors ligne' :
                'Erreur système'
              }
            />
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="Clock" size={16} />
              <span>
                Dernière màj: {lastUpdated ? lastUpdated.toLocaleTimeString('fr-FR') : 'Jamais'}
              </span>
            </div>
            
            <button
              onClick={handleRefreshData}
              className="p-2 rounded-full hover:bg-surface-secondary text-text-secondary hover:text-primary transition-colors"
              title="Rafraîchir les données"
              disabled={isLoading}
            >
              <Icon name="RefreshCw" size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Alertes d'erreur globales */}
        {hasErrors && (
          <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-error/20 p-2 text-error">
                <Icon name="AlertTriangle" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Erreurs détectées</h3>
                <p className="text-sm text-text-secondary">
                  Certaines données n'ont pas pu être chargées. Vérifiez la connectivité.
                </p>
              </div>
            </div>
            <button 
              onClick={handleRefreshData} 
              className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : 'Réessayer'}
            </button>
          </div>
        )}

        {/* Navigation des onglets */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu principal basé sur l'onglet actif */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Cartes de statistiques */}
              <AdminStatsCards
                stats={data.stats}
                loading={loading.stats}
                error={errors.stats}
              />
              
              {/* Vue d'ensemble système */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemOverview
                  dashboard={data.dashboard}
                  health={data.health}
                  loading={loading.dashboard || loading.health}
                />
                
                <SystemActivity
                  activities={data.activity}
                  loading={loading.activity}
                  error={errors.activity}
                />
              </div>
              
              {/* Actions rapides */}
              <AdminQuickActions onRefresh={handleRefreshData} />
            </>
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={data.users}
              loading={loading.users}
              error={errors.users}
              onCreateUser={createUser}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
              onRefresh={() => loadUsers()}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceMetrics
              performance={data.performance}
              loading={loading.performance}
              error={errors.performance}
            />
          )}

          {activeTab === 'system' && (
            <SystemHealth
              health={data.health}
              logs={data.logs}
              loading={{
                health: loading.health,
                logs: loading.logs
              }}
              errors={{
                health: errors.health,
                logs: errors.logs
              }}
            />
          )}

          {activeTab === 'logs' && (
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-heading font-semibold text-text-primary mb-4 flex items-center space-x-2">
                  <Icon name="FileText" size={24} />
                  <span>Logs Système</span>
                </h2>
                
                {loading.logs ? (
                  <div className="flex items-center justify-center py-8">
                    <Icon name="Loader2" size={24} className="animate-spin text-primary" />
                    <span className="ml-2 text-text-secondary">Chargement des logs...</span>
                  </div>
                ) : errors.logs ? (
                  <div className="text-center py-8">
                    <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
                    <p className="text-text-secondary">Erreur lors du chargement des logs</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.logs && data.logs.length > 0 ? (
                      data.logs.map((log, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            log.level === 'ERROR' ? 'bg-error/5 border-error/20' :
                            log.level === 'WARN' ? 'bg-warning/5 border-warning/20' :
                            'bg-surface-secondary border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                log.level === 'ERROR' ? 'bg-error text-white' :
                                log.level === 'WARN' ? 'bg-warning text-white' :
                                'bg-primary text-white'
                              }`}>
                                {log.level}
                              </span>
                              <span className="font-medium text-text-primary">{log.source}</span>
                            </div>
                            <span className="text-sm text-text-secondary">
                              {new Date(log.timestamp).toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <p className="mt-2 text-text-secondary">{log.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-text-secondary">Aucun log disponible</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
