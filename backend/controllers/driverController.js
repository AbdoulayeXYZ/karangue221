const Driver = require('../models/driverModel');

// Contrôleurs multi-tenant
exports.getAll = async (req, res) => {
  try {
    let drivers;
    
    // Si tenant_id est disponible, utiliser la version multi-tenant
    if (req.tenant_id) {
      drivers = await Driver.getAllByTenant(req.tenant_id);
    } else {
      // Fallback vers l'ancienne version pour compatibilité
      drivers = await Driver.getAll();
    }
    
    res.json({
      success: true,
      drivers: drivers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des conducteurs:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les conducteurs'
    });
  }
};

exports.getById = async (req, res) => {
  try {
    let driver;
    
    if (req.tenant_id) {
      driver = await Driver.getByIdAndTenant(req.params.id, req.tenant_id);
    } else {
      driver = await Driver.getById(req.params.id);
    }
    
    if (!driver) {
      return res.status(404).json({ 
        error: 'Conducteur introuvable',
        message: `Aucun conducteur trouvé avec l'ID ${req.params.id}`
      });
    }
    
    res.json({
      success: true,
      driver: driver
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du conducteur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le conducteur'
    });
  }
};

exports.create = async (req, res) => {
  try {
    let newDriver;
    
    if (req.tenant_id) {
      newDriver = await Driver.createWithTenant(req.body, req.tenant_id);
    } else {
      newDriver = await Driver.create(req.body);
    }
    
    res.status(201).json({
      success: true,
      message: 'Conducteur créé avec succès',
      driver: newDriver
    });
  } catch (error) {
    console.error('Erreur lors de la création du conducteur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de créer le conducteur'
    });
  }
};

exports.update = async (req, res) => {
  try {
    let success;
    
    if (req.tenant_id) {
      success = await Driver.updateWithTenant(req.params.id, req.body, req.tenant_id);
    } else {
      await Driver.update(req.params.id, req.body);
      success = true;
    }
    
    if (!success) {
      return res.status(404).json({ 
        error: 'Conducteur introuvable',
        message: `Aucun conducteur trouvé avec l'ID ${req.params.id}`
      });
    }
    
    res.json({ 
      success: true,
      message: 'Conducteur mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du conducteur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour le conducteur'
    });
  }
};

exports.remove = async (req, res) => {
  try {
    let success;
    
    if (req.tenant_id) {
      success = await Driver.removeWithTenant(req.params.id, req.tenant_id);
    } else {
      await Driver.remove(req.params.id);
      success = true;
    }
    
    if (!success) {
      return res.status(404).json({ 
        error: 'Conducteur introuvable',
        message: `Aucun conducteur trouvé avec l'ID ${req.params.id}`
      });
    }
    
    res.json({ 
      success: true,
      message: 'Conducteur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du conducteur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de supprimer le conducteur'
    });
  }
};

// Nouvelles méthodes spécifiques au multi-tenant
exports.getByFleet = async (req, res) => {
  try {
    if (!req.tenant_id) {
      return res.status(400).json({ 
        error: 'Tenant requis',
        message: 'Cette opération nécessite un tenant valide'
      });
    }
    
    const drivers = await Driver.getDriversByFleetAndTenant(req.params.fleetId, req.tenant_id);
    
    res.json({
      success: true,
      drivers: drivers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des conducteurs par flotte:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les conducteurs de cette flotte'
    });
  }
};

exports.getActive = async (req, res) => {
  try {
    let drivers;
    
    if (req.tenant_id) {
      drivers = await Driver.getActiveDriversByTenant(req.tenant_id);
    } else {
      // Fallback pour compatibilité
      const allDrivers = await Driver.getAll();
      drivers = allDrivers.filter(d => d.status === 'active');
    }
    
    res.json({
      success: true,
      drivers: drivers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des conducteurs actifs:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les conducteurs actifs'
    });
  }
};

exports.search = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({ 
        error: 'Paramètre de recherche manquant',
        message: 'Le paramètre "q" est requis pour la recherche'
      });
    }
    
    let drivers;
    
    if (req.tenant_id) {
      drivers = await Driver.searchDriversByTenant(searchTerm, req.tenant_id);
    } else {
      // Fallback simple pour compatibilité
      const allDrivers = await Driver.getAll();
      drivers = allDrivers.filter(d => 
        d.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone?.includes(searchTerm) ||
        d.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      drivers: drivers,
      searchTerm: searchTerm
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de conducteurs:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible d\'effectuer la recherche'
    });
  }
};
