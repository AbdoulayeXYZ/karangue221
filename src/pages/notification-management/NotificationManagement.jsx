import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import Icon from '../../components/AppIcon';
import Breadcrumb from '../../components/ui/Breadcrumb';

const NotificationManagement = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter(notification => {
    switch (activeFilter) {
      case 'unread':
        return notification.status === 'unread';
      case 'read':
        return notification.status === 'read';
      case 'alerts':
        return notification.type === 'alert' || notification.type === 'warning' || notification.type === 'error';
      case 'maintenance':
        return notification.type === 'maintenance';
      case 'system':
        return notification.type === 'system';
      case 'vehicle':
        return notification.type === 'vehicle';
      case 'driver':
        return notification.type === 'driver';
      default:
        return true;
    }
  });

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(n => n !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return 'AlertTriangle';
      case 'error':
        return 'AlertCircle';
      case 'success':
        return 'CheckCircle';
      case 'maintenance':
        return 'Wrench';
      case 'system':
        return 'Settings';
      case 'vehicle':
        return 'Truck';
      case 'driver':
        return 'User';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return 'text-warning';
      case 'error':
        return 'text-error';
      case 'success':
        return 'text-success';
      case 'maintenance':
        return 'text-info';
      case 'system':
        return 'text-secondary';
      case 'vehicle':
        return 'text-primary';
      case 'driver':
        return 'text-primary';
      default:
        return 'text-text-secondary';
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return 'bg-warning/10';
      case 'error':
        return 'bg-error/10';
      case 'success':
        return 'bg-success/10';
      case 'maintenance':
        return 'bg-info/10';
      case 'system':
        return 'bg-secondary/10';
      case 'vehicle':
        return 'bg-primary/10';
      case 'driver':
        return 'bg-primary/10';
      default:
        return 'bg-surface-secondary';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'À l\'instant';
    
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} j`;
  };

  const filters = [
    { id: 'all', label: 'Toutes', count: notifications.length },
    { id: 'unread', label: 'Non lues', count: unreadCount },
    { id: 'read', label: 'Lues', count: notifications.length - unreadCount },
    { id: 'alerts', label: 'Alertes', count: notifications.filter(n => ['alert', 'warning', 'error'].includes(n.type)).length },
    { id: 'maintenance', label: 'Maintenance', count: notifications.filter(n => n.type === 'maintenance').length },
    { id: 'system', label: 'Système', count: notifications.filter(n => n.type === 'system').length },
    { id: 'vehicle', label: 'Véhicules', count: notifications.filter(n => n.type === 'vehicle').length },
    { id: 'driver', label: 'Conducteurs', count: notifications.filter(n => n.type === 'driver').length }
  ];

  useEffect(() => {
    setShowBulkActions(selectedNotifications.length > 0);
  }, [selectedNotifications]);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 lg:px-6 py-6">
        <Breadcrumb />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              Gestion des Notifications
            </h1>
            <p className="text-text-secondary">
              Gérez et surveillez toutes les notifications de votre système
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-base hover:bg-primary-700 transition-colors duration-150"
              >
                <Icon name="Check" size={16} />
                <span>Tout marquer comme lu</span>
              </button>
            )}
            
            <button
              onClick={() => fetchNotifications()}
              className="flex items-center space-x-2 px-4 py-2 bg-surface-secondary text-text-primary rounded-base hover:bg-surface-tertiary transition-colors duration-150"
            >
              <Icon name="RefreshCw" size={16} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface p-4 rounded-base border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total</p>
                <p className="text-2xl font-bold text-text-primary">{notifications.length}</p>
              </div>
              <Icon name="Bell" size={24} className="text-primary" />
            </div>
          </div>
          
          <div className="bg-surface p-4 rounded-base border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Non lues</p>
                <p className="text-2xl font-bold text-error">{unreadCount}</p>
              </div>
              <Icon name="Mail" size={24} className="text-error" />
            </div>
          </div>
          
          <div className="bg-surface p-4 rounded-base border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Alertes</p>
                <p className="text-2xl font-bold text-warning">
                  {notifications.filter(n => ['alert', 'warning', 'error'].includes(n.type)).length}
                </p>
              </div>
              <Icon name="AlertTriangle" size={24} className="text-warning" />
            </div>
          </div>
          
          <div className="bg-surface p-4 rounded-base border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Aujourd'hui</p>
                <p className="text-2xl font-bold text-text-primary">
                  {notifications.filter(n => {
                    const today = new Date();
                    const notificationDate = new Date(n.timestamp);
                    return today.toDateString() === notificationDate.toDateString();
                  }).length}
                </p>
              </div>
              <Icon name="Calendar" size={24} className="text-primary" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface p-4 rounded-base border border-border mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-base text-sm font-medium transition-colors duration-150 ${
                  activeFilter === filter.id
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <span>{filter.label}</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-surface p-4 rounded-base border border-border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-text-secondary">
                  {selectedNotifications.length} notification(s) sélectionnée(s)
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary hover:text-primary-700 font-medium"
                >
                  {selectedNotifications.length === filteredNotifications.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-white rounded-base text-sm hover:bg-primary-700 transition-colors duration-150"
                >
                  <Icon name="Check" size={14} />
                  <span>Marquer comme lu</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-error text-white rounded-base text-sm hover:bg-error-700 transition-colors duration-150"
                >
                  <Icon name="Trash2" size={14} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-surface rounded-base border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-text-secondary">
              <Icon name="Loader" size={32} className="animate-spin mx-auto mb-4" />
              <p>Chargement des notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-error">
              <Icon name="AlertCircle" size={32} className="mx-auto mb-4" />
              <p>Erreur: {error}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              <Icon name="BellOff" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucune notification</p>
              <p className="text-sm">Aucune notification ne correspond aux critères sélectionnés.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-surface-secondary transition-colors duration-150 ${
                    notification.status === 'unread' ? 'bg-surface-secondary/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    
                    {/* Icon */}
                    <div className={`p-2 rounded-base ${getNotificationBgColor(notification.type)}`}>
                      <Icon 
                        name={getNotificationIcon(notification.type)} 
                        size={20} 
                        className={getNotificationColor(notification.type)}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-text-primary font-medium mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-text-secondary">
                            <span className="capitalize">{notification.type}</span>
                            <span>{formatTimeAgo(notification.timestamp)}</span>
                            {notification.vehicle_id && (
                              <span>Véhicule #{notification.vehicle_id}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.status === 'unread' && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-text-secondary hover:text-error transition-colors duration-150"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement; 