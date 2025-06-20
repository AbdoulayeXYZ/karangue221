import React, { useEffect } from 'react';
import useApiResource from 'hooks/useApiResource';
import * as deviceApi from 'services/api/devices';

const DeviceManagement = () => {
  const { data: devices, loading, error, fetchAll } = useApiResource({
    getAll: deviceApi.getDevices,
    create: deviceApi.createDevice,
    update: deviceApi.updateDevice,
    remove: deviceApi.removeDevice
  });
  useEffect(() => { fetchAll(); }, [fetchAll]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Devices</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {devices.map(dev => (
          <li key={dev.id} className="py-2">{dev.imei} - {dev.type}</li>
        ))}
      </ul>
    </div>
  );
};
export default DeviceManagement; 