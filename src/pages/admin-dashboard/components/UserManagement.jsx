import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';

const UserManagement = ({ 
  users, 
  loading, 
  error, 
  onCreateUser, 
  onUpdateUser, 
  onDeleteUser, 
  onRefresh 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire pour création/édition
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner',
    phone: '',
    status: 'active'
  });

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'owner',
      phone: '',
      status: 'active'
    });
  }, []);

  const handleCreateUser = useCallback(() => {
    resetForm();
    setIsCreateModalOpen(true);
  }, [resetForm]);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      status: user.status
    });
    setIsEditModalOpen(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isCreateModalOpen) {
        await onCreateUser(formData);
        setIsCreateModalOpen(false);
      } else if (isEditModalOpen && selectedUser) {
        const updates = { ...formData };
        if (!updates.password) {
          delete updates.password;
        }
        await onUpdateUser(selectedUser.id, updates);
        setIsEditModalOpen(false);
      }
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert(error.response?.data?.details || 'Erreur lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir désactiver l'utilisateur "${userName}" ?`)) {
      try {
        await onDeleteUser(userId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(error.response?.data?.details || 'Erreur lors de la suppression');
      }
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    return role === 'admin' ? 'text-error bg-error/10' : 'text-primary bg-primary/10';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-success bg-success/10' : 'text-warning bg-warning/10';
  };

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-surface rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header et actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-semibold text-text-primary">
            Gestion des Utilisateurs
          </h2>
          <p className="text-text-secondary">
            {filteredUsers.length} utilisateur(s) affiché(s)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
          
          <button
            onClick={handleCreateUser}
            className="btn-primary flex items-center space-x-2"
          >
            <Icon name="Plus" size={16} />
            <span>Nouvel utilisateur</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom ou email..."
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
              >
                <option value="all">Tous les rôles</option>
                <option value="owner">Propriétaires</option>
                <option value="admin">Administrateurs</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <Icon name="Loader2" size={24} className="animate-spin text-primary mx-auto mb-2" />
            <p className="text-text-secondary">Chargement des utilisateurs...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Icon name="AlertTriangle" size={24} className="text-warning mx-auto mb-2" />
            <p className="text-text-secondary">Erreur lors du chargement</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Users" size={24} className="text-text-secondary mx-auto mb-2" />
            <p className="text-text-secondary">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-text-secondary">Utilisateur</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Rôle</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Statut</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Flottes</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Créé le</th>
                  <th className="text-center p-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-surface-secondary">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-text-primary">{user.name}</div>
                        <div className="text-sm text-text-secondary">{user.email}</div>
                        {user.phone && (
                          <div className="text-xs text-text-secondary">{user.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' ? 'Administrateur' : 'Propriétaire'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-primary">{user.fleet_count || 0}</span>
                    </td>
                    <td className="p-4 text-text-secondary">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-surface-secondary rounded"
                          title="Modifier"
                        >
                          <Icon name="Edit2" size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded"
                          title="Désactiver"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer un nouvel utilisateur"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Mot de passe *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Rôle *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="input"
              required
            >
              <option value="owner">Propriétaire</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'utilisateur"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nouveau mot de passe (laisser vide pour conserver)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input"
              minLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Rôle *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="input"
              required
            >
              <option value="owner">Propriétaire</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Statut *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="input"
              required
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
