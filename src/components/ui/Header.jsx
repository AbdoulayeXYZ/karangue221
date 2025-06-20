import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationTabs = [
    {
      id: 'dashboard',
      labelFr: 'Tableau de Bord',
      path: '/fleet-dashboard',
      icon: 'LayoutDashboard',
      tooltip: 'Vue d\'ensemble de la flotte'
    },
    {
      id: 'tracking',
      labelFr: 'Suivi en Temps Réel',
      path: '/live-vehicle-tracking',
      icon: 'MapPin',
      tooltip: 'Suivi GPS des véhicules'
    },
    {
      id: 'cameras',
      labelFr: 'Caméras',
      path: '/camera-feed-viewer',
      icon: 'Video',
      tooltip: 'Gestion des flux caméras'
    },
    {
      id: 'drivers',
      labelFr: 'Conducteurs',
      path: '/driver-behavior-analytics',
      icon: 'UserCheck',
      tooltip: 'Analyse comportementale des conducteurs'
    },
    {
      id: 'vehicles',
      labelFr: 'Véhicules',
      path: '/vehicle-management',
      icon: 'Truck',
      tooltip: 'Gestion de la flotte'
    }
  ];

  const notifications = [
    { id: 1, type: 'warning', message: 'Véhicule SN-001 en excès de vitesse', time: '2 min' },
    { id: 2, type: 'error', message: 'Perte de signal GPS - Véhicule SN-045', time: '5 min' },
    { id: 3, type: 'success', message: 'Maintenance programmée terminée', time: '10 min' }
  ];

  const currentUser = {
    name: 'Amadou Diallo',
    role: 'Gestionnaire de Flotte',
    avatar: '/assets/images/avatar.png'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Simulate WebSocket connection status
    const interval = setInterval(() => {
      const statuses = ['connected', 'connecting', 'disconnected'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setConnectionStatus(randomStatus);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (path) => {
    navigate(path);
  };

  const handleKeyDown = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'disconnected': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return 'Wifi';
      case 'connecting': return 'WifiOff';
      case 'disconnected': return 'WifiOff';
      default: return 'Wifi';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return 'AlertTriangle';
      case 'error': return 'AlertCircle';
      case 'success': return 'CheckCircle';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'success': return 'text-success';
      default: return 'text-text-secondary';
    }
  };

  if (location.pathname === '/login') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-1000 bg-surface border-b border-border shadow-elevation-1">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-base flex items-center justify-center">
                <Icon name="Truck" size={20} color="white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-heading font-semibold text-primary">
                  Karangue221
                </h1>
                <p className="text-xs text-text-secondary font-caption">
                  Gestion de Flotte GPS
                </p>
              </div>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Navigation principale">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                onKeyDown={(e) => handleKeyDown(e, tab.path)}
                className={`nav-tab ${location.pathname === tab.path ? 'active' : ''}`}
                title={tab.tooltip}
                aria-current={location.pathname === tab.path ? 'page' : undefined}
              >
                <div className="flex items-center space-x-2">
                  <Icon name={tab.icon} size={18} />
                  <span className="font-medium">{tab.labelFr}</span>
                </div>
              </button>
            ))}
          </nav>

          {/* Right Section - Status, Notifications, User */}
          <div className="flex items-center space-x-4">
            {/* System Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-surface-secondary rounded-base">
              <Icon 
                name={getStatusIcon(connectionStatus)} 
                size={16} 
                className={`${getStatusColor(connectionStatus)} transition-colors duration-150`}
              />
              <span className="text-sm font-medium text-text-secondary">
                {connectionStatus === 'connected' ? 'Connecté' : 
                 connectionStatus === 'connecting' ? 'Connexion...' : 'Déconnecté'}
              </span>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow"></div>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-base hover:bg-surface-secondary"
                aria-label="Notifications"
              >
                <Icon name="Bell" size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-base shadow-elevation-3 z-1100 animate-fade-in">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-heading font-semibold text-text-primary">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-border-light hover:bg-surface-secondary transition-colors duration-150">
                        <div className="flex items-start space-x-3">
                          <Icon 
                            name={getNotificationIcon(notification.type)} 
                            size={16} 
                            className={`mt-0.5 ${getNotificationColor(notification.type)}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary">{notification.message}</p>
                            <p className="text-xs text-text-secondary mt-1">Il y a {notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border">
                    <button className="w-full text-sm text-secondary hover:text-secondary-700 font-medium transition-colors duration-150">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-base hover:bg-surface-secondary"
                aria-label="Menu utilisateur"
              >
                <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} className="text-primary" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-text-primary">{currentUser.name}</p>
                  <p className="text-xs text-text-secondary">{currentUser.role}</p>
                </div>
                <Icon name="ChevronDown" size={16} className={`transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-base shadow-elevation-3 z-1100 animate-fade-in">
                  <div className="p-4 border-b border-border">
                    <p className="font-medium text-text-primary">{currentUser.name}</p>
                    <p className="text-sm text-text-secondary">{currentUser.role}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors duration-150 flex items-center space-x-2">
                      <Icon name="User" size={16} />
                      <span>Profil</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors duration-150 flex items-center space-x-2">
                      <Icon name="Settings" size={16} />
                      <span>Paramètres</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors duration-150 flex items-center space-x-2">
                      <Icon name="HelpCircle" size={16} />
                      <span>Aide</span>
                    </button>
                  </div>
                  <div className="border-t border-border py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-50 transition-colors duration-150 flex items-center space-x-2">
                      <Icon name="LogOut" size={16} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-base hover:bg-surface-secondary">
              <Icon name="Menu" size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;