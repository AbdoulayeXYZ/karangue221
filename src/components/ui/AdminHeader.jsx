import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/api/users';
import NotificationDropdown from './NotificationDropdown';

const AdminHeader = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [userProfile, setUserProfile] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // User profile loading effect
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          setIsProfileLoading(true);
          const profileData = await getUserProfile();
          setUserProfile(profileData);
          
          // Set a simulated last activity time
          const now = new Date();
          setLastActivity(now.toISOString());
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        } finally {
          setIsProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
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
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsUserMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsUserMenuOpen(false);
  };

  const handleHelpClick = () => {
    navigate('/help');
    setIsUserMenuOpen(false);
  };
  
  const formatLastActivity = (timestamp) => {
    if (!timestamp) return 'Jamais';
    
    const lastActivity = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastActivity) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} j`;
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

  if (location.pathname === '/login') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-1000 bg-surface border-b border-border shadow-elevation-1">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Admin Version */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-base flex items-center justify-center">
                <Icon name="Shield" size={20} color="white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-heading font-semibold text-primary">
                  Administration
                </h1>
                <p className="text-xs text-text-secondary font-caption">
                  Karangue221
                </p>
              </div>
            </div>
          </div>

          {/* Navigation rapide admin */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Navigation administration">
            
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
                {connectionStatus === 'connected' ? 'Système Connecté' : 
                 connectionStatus === 'connecting' ? 'Vérification...' : 'Système Déconnecté'}
              </span>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow"></div>
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-base hover:bg-surface-secondary"
                aria-label="Menu utilisateur administrateur"
                aria-expanded={isUserMenuOpen}
              >
                <div className="relative w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user?.firstName || 'Avatar administrateur'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="UserCheck" size={16} className="text-primary" />
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-warning rounded-full border-2 border-surface"></span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-text-primary">
                    {isProfileLoading ? 'Chargement...' : user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Administrateur'}
                  </p>
                  <p className="text-xs text-warning font-medium">Administrateur</p>
                </div>
                <Icon name="ChevronDown" size={16} className={`transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-base shadow-elevation-3 z-1100 animate-fade-in">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user?.firstName || 'Avatar administrateur'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon name="UserCheck" size={24} className="text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {isProfileLoading ? 'Chargement...' : user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Administrateur'}
                        </p>
                        <p className="text-sm text-warning font-medium">Administrateur Système</p>
                        <p className="text-xs text-text-tertiary mt-1">{user?.email || ''}</p>
                      </div>
                    </div>
                    
                    {userProfile && (
                      <div className="mt-3 pt-3 border-t border-border-light">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-text-tertiary">Dernière connexion</p>
                            <p className="text-text-secondary font-medium">{formatLastActivity(lastActivity)}</p>
                          </div>
                          <div>
                            <p className="text-text-tertiary">Statut</p>
                            <p className="text-warning font-medium flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-warning mr-1.5"></span>
                              Administrateur
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="py-2">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Icon name="User" size={16} />
                      <span>Mon Profil</span>
                    </button>
                    <button 
                      onClick={handleSettingsClick}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Icon name="Settings" size={16} />
                      <span>Paramètres Admin</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/admin-audit-logs');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Icon name="FileSearch" size={16} />
                      <span>Logs d'Audit</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/admin-backup');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Icon name="Download" size={16} />
                      <span>Sauvegardes</span>
                    </button>
                    <button 
                      onClick={handleHelpClick}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Icon name="HelpCircle" size={16} />
                      <span>Documentation Admin</span>
                    </button>
                  </div>
                  
                  <div className="p-3 border-t border-border">
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 transition-colors duration-150 flex items-center space-x-2"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
