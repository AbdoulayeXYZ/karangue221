import React, { useEffect, useState } from 'react';
import useApiResource from 'hooks/useApiResource';
import * as activityApi from 'services/api/activities';

const ActivityManagement = () => {
  const { data: activities, loading, error, fetchAll, create, update, remove } = useApiResource({
    getAll: activityApi.getActivities,
    create: activityApi.createActivity,
    update: activityApi.updateActivity,
    remove: activityApi.removeActivity
  });
  useEffect(() => { fetchAll(); }, [fetchAll]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Activités</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {activities.map(act => (
          <li key={act.id} className="py-2">{act.type} - {act.description}</li>
        ))}
      </ul>
    </div>
  );
};
export default ActivityManagement; 