import React, { useEffect } from 'react';
import useApiResource from 'hooks/useApiResource';
import * as assignmentApi from 'services/api/vehicleAssignments';

const AssignmentManagement = () => {
  const { data: assignments, loading, error, fetchAll } = useApiResource({
    getAll: assignmentApi.getAssignments,
    create: assignmentApi.createAssignment,
    update: assignmentApi.updateAssignment,
    remove: assignmentApi.removeAssignment
  });
  useEffect(() => { fetchAll(); }, [fetchAll]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Affectations</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {assignments.map(ass => (
          <li key={ass.id} className="py-2">Véhicule {ass.vehicle_id} - Conducteur {ass.driver_id} - {ass.status}</li>
        ))}
      </ul>
    </div>
  );
};
export default AssignmentManagement; 