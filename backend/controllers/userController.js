const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.getAll = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (error) {
    console.error('Error getting user by id:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Récupéré depuis le middleware auth
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Ne pas retourner le mot de passe hashé
    const { password_hash, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;
    
    await User.update(userId, { name, email, phone });
    
    // Retourner le profil mis à jour
    const updatedUser = await User.getById(userId);
    const { password_hash, ...userProfile } = updatedUser;
    
    res.json(userProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }
    
    // Récupérer l'utilisateur actuel
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }
    
    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Mettre à jour le mot de passe
    await User.update(userId, { password_hash: hashedNewPassword });
    
    res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

exports.create = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

exports.update = async (req, res) => {
  try {
    await User.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

exports.remove = async (req, res) => {
  try {
    await User.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};
