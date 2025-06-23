import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import Icon from '../AppIcon';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter(notification => {
    switch (activeFilter) {
      case 'unread':
        return notification.status === 'unread';
      case 'alerts':
        return notification.type === 'alert' || notification.type === 'warning' || notification.type === 'error';
      case 'maintenance':
        return notification.type === 'maintenance';
      case 'system':
        return notification.type === 'system';
      default:
        return true;
    }
  });

  const handleNotificationClick = async (notification) => {
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }
    // You can add navigation logic here based on notification type
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
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
    { id: 'all', label: 'Toutes', icon: 'Bell' },
    { id: 'unread', label: 'Non lues', icon: 'Mail' },
    { id: 'alerts', label: 'Alertes', icon: 'AlertTriangle' },
    { id: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
    { id: 'system', label: 'Système', icon: 'Settings' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 rounded-base hover:bg-surface-secondary"
        aria-label="Notifications"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-surface border border-border rounded-base shadow-elevation-3 z-1100 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-secondary hover:text-secondary-700 font-medium transition-colors duration-150"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 border-b border-border">
            <div className="flex space-x-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-base text-xs font-medium transition-colors duration-150 ${
                    activeFilter === filter.id
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <Icon name={filter.icon} size={12} />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-text-secondary">
                <Icon name="Loader" size={20} className="animate-spin mx-auto mb-2" />
                <span>Chargement...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <Icon name="BellOff" size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-border-light hover:bg-surface-secondary transition-colors duration-150 cursor-pointer ${
                    notification.status === 'unread' ? 'bg-surface-secondary/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-base ${getNotificationBgColor(notification.type)}`}>
                      <Icon 
                        name={getNotificationIcon(notification.type)} 
                        size={16} 
                        className={getNotificationColor(notification.type)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-text-primary font-medium">
                          {notification.message}
                        </p>
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="ml-2 p-1 text-text-secondary hover:text-error transition-colors duration-150 opacity-0 group-hover:opacity-100"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-text-secondary">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <button 
              onClick={() => {
                setIsOpen(false);
                // Navigate to notification management page
                window.location.href = '/notification-management';
              }}
              className="w-full text-sm text-secondary hover:text-secondary-700 font-medium transition-colors duration-150"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 