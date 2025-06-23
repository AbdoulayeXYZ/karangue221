const db = require('../config/db');

exports.getAll = async (userId = null, filters = {}) => {
  let query = 'SELECT * FROM notifications';
  let params = [];
  
  if (userId) {
    query += ' WHERE user_id = ?';
    params.push(userId);
  }
  
  if (filters.status) {
    query += userId ? ' AND status = ?' : ' WHERE status = ?';
    params.push(filters.status);
  }
  
  if (filters.type) {
    query += (userId || filters.status) ? ' AND type = ?' : ' WHERE type = ?';
    params.push(filters.type);
  }
  
  query += ' ORDER BY timestamp DESC';
  
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  const [rows] = await db.query(query, params);
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [id]);
  return rows[0];
};

exports.getUnreadCount = async (userId = null) => {
  let query = 'SELECT COUNT(*) as count FROM notifications WHERE status = "unread"';
  let params = [];
  
  if (userId) {
    query += ' AND user_id = ?';
    params.push(userId);
  }
  
  const [rows] = await db.query(query, params);
  return rows[0].count;
};

exports.create = async (notification) => {
  const [result] = await db.query('INSERT INTO notifications SET ?', notification);
  return { id: result.insertId, ...notification };
};

exports.update = async (id, notification) => {
  await db.query('UPDATE notifications SET ? WHERE id = ?', [notification, id]);
};

exports.markAsRead = async (id) => {
  await db.query('UPDATE notifications SET status = "read" WHERE id = ?', [id]);
};

exports.markAllAsRead = async (userId = null) => {
  let query = 'UPDATE notifications SET status = "read"';
  let params = [];
  
  if (userId) {
    query += ' WHERE user_id = ?';
    params.push(userId);
  }
  
  await db.query(query, params);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM notifications WHERE id = ?', [id]);
};

exports.removeOld = async (days = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  await db.query('DELETE FROM notifications WHERE timestamp < ? AND status = "read"', [date]);
};

// Create system notifications
exports.createSystemNotification = async (type, message, userId = null) => {
  const notification = {
    user_id: userId,
    type: type,
    message: message,
    status: 'unread',
    timestamp: new Date()
  };
  
  return await this.create(notification);
};

// Create vehicle-specific notifications
exports.createVehicleNotification = async (vehicleId, type, message, userId = null) => {
  const notification = {
    user_id: userId,
    type: type,
    message: message,
    status: 'unread',
    timestamp: new Date(),
    vehicle_id: vehicleId
  };
  
  return await this.create(notification);
}; 