import React, { useEffect } from 'react';
import useApiResource from 'hooks/useApiResource';
import * as notificationApi from 'services/api/notifications';

const NotificationManagement = () => {
  const { data: notifications, loading, error, fetchAll } = useApiResource({
    getAll: notificationApi.getNotifications,
    create: notificationApi.createNotification,
    update: notificationApi.updateNotification,
    remove: notificationApi.removeNotification
  });
  useEffect(() => { fetchAll(); }, [fetchAll]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Notifications</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {notifications.map(notif => (
          <li key={notif.id} className="py-2">{notif.type} - {notif.message}</li>
        ))}
      </ul>
    </div>
  );
};
export default NotificationManagement; 