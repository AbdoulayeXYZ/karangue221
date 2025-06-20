import React, { useEffect } from 'react';
import useApiResource from 'hooks/useApiResource';
import * as fleetApi from 'services/api/fleets';

const FleetManagement = () => {
  const { data: fleets, loading, error, fetchAll } = useApiResource({
    getAll: fleetApi.getFleets,
    create: fleetApi.createFleet,
    update: fleetApi.updateFleet,
    remove: fleetApi.removeFleet
  });
  useEffect(() => { fetchAll(); }, [fetchAll]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Flottes</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {fleets.map(fleet => (
          <li key={fleet.id} className="py-2">{fleet.name} - {fleet.description}</li>
        ))}
      </ul>
    </div>
  );
};
export default FleetManagement; 