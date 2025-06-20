import React, { useEffect } from 'react';
import useApiResource from 'hooks/useApiResource';
import * as telemetryApi from 'services/api/telemetry';

const TelemetryManagement = () => {
  const { data: telemetry, loading, error, fetchAll } = useApiResource({
    getAll: telemetryApi.getTelemetry,
    create: telemetryApi.createTelemetry,
    update: telemetryApi.updateTelemetry,
    remove: telemetryApi.removeTelemetry
  });
  useEffect(() => { fetchAll(); }, [fetchAll]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion de la Télémétrie</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {telemetry.map(tel => (
          <li key={tel.id} className="py-2">Véhicule {tel.vehicle_id} - {tel.timestamp} - {tel.speed} km/h</li>
        ))}
      </ul>
    </div>
  );
};
export default TelemetryManagement; 