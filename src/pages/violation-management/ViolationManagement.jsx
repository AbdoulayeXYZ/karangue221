import React, { useEffect } from 'react';
import useApiResource from 'hooks/useApiResource';
import * as violationApi from 'services/api/violations';

const ViolationManagement = () => {
  const { data: violations, loading, error, fetchAll } = useApiResource({
    getAll: violationApi.getViolations,
    create: violationApi.createViolation,
    update: violationApi.updateViolation,
    remove: violationApi.removeViolation
  });
  useEffect(() => { fetchAll(); }, [fetchAll]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Violations</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {violations.map(vio => (
          <li key={vio.id} className="py-2">{vio.type} - {vio.severity} - {vio.status}</li>
        ))}
      </ul>
    </div>
  );
};
export default ViolationManagement; 