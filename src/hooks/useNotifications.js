import { useState, useEffect, useCallback } from 'react';
import * as notificationApi from '../services/api/notifications';
import webSocketService from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationApi.getNotifications(filters);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, status: 'read' } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, status: 'read' }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationApi.removeNotification(id);
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      // Update unread count if the deleted notification was unread
      if (deletedNotification?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (notification.status === 'unread') {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Update notification
  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, ...updates } : notif
      )
    );
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log('New notification received via WebSocket:', notification);
      addNotification(notification);
    };

    const handleNotificationUpdate = (data) => {
      const { id, updates } = data;
      updateNotification(id, updates);
    };

    const handleWebSocketConnected = () => {
      console.log('WebSocket connected, notifications will be real-time');
    };

    const handleWebSocketDisconnected = () => {
      console.log('WebSocket disconnected, falling back to polling');
    };

    // Subscribe to WebSocket events
    webSocketService.on('notification', handleNewNotification);
    webSocketService.on('notification_update', handleNotificationUpdate);
    webSocketService.on('connected', handleWebSocketConnected);
    webSocketService.on('disconnected', handleWebSocketDisconnected);

    // Connect to WebSocket if not already connected
    if (!webSocketService.isConnected) {
      webSocketService.connect();
    }

    // Cleanup
    return () => {
      webSocketService.off('notification', handleNewNotification);
      webSocketService.off('notification_update', handleNotificationUpdate);
      webSocketService.off('connected', handleWebSocketConnected);
      webSocketService.off('disconnected', handleWebSocketDisconnected);
    };
  }, [addNotification, updateNotification]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, fetching notifications...');
      fetchNotifications();
      fetchUnreadCount();
    } else {
      console.log('User not authenticated, skipping notification fetch.');
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Set up polling for real-time updates (fallback when WebSocket is not available)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only poll if WebSocket is not connected and user is authenticated
      if (isAuthenticated && !webSocketService.isConnected) {
        fetchUnreadCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    updateNotification,
    webSocketStatus: webSocketService.getConnectionStatus()
  };
}; 