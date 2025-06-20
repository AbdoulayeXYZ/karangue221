import React, { useEffect } from 'react';
import useApiResource from 'hooks/useApiResource';
import * as userApi from 'services/api/users';

const UserManagement = () => {
  const { data: users, loading, error, fetchAll } = useApiResource({
    getAll: userApi.getUsers,
    create: userApi.createUser,
    update: userApi.updateUser,
    remove: userApi.removeUser
  });
  useEffect(() => { fetchAll(); }, [fetchAll]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y">
        {users.map(user => (
          <li key={user.id} className="py-2">{user.name} - {user.email} - {user.role}</li>
        ))}
      </ul>
    </div>
  );
};
export default UserManagement; 