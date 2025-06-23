const API_URL = 'http://localhost:5001/api/notifications';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getNotifications(filters = {}) {
  const queryParams = new URLSearchParams();
  
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.limit) queryParams.append('limit', filters.limit);
  
  const url = queryParams.toString() ? `${API_URL}?${queryParams.toString()}` : API_URL;
  
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement notifications');
  return res.json();
}

export async function getNotification(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement notification');
  return res.json();
}

export async function getUnreadCount() {
  const res = await fetch(`${API_URL}/unread/count`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement compteur notifications');
  return res.json();
}

export async function createNotification(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création notification');
  return res.json();
}

export async function createSystemNotification(type, message, userId = null) {
  const res = await fetch(`${API_URL}/system`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ type, message, userId })
  });
  if (!res.ok) throw new Error('Erreur création notification système');
  return res.json();
}

export async function updateNotification(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur modification notification');
  return res.json();
}

export async function markAsRead(id) {
  const res = await fetch(`${API_URL}/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erreur marquage notification');
  return res.json();
}

export async function markAllAsRead() {
  const res = await fetch(`${API_URL}/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erreur marquage notifications');
  return res.json();
}

export async function removeNotification(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erreur suppression notification');
  return res.json();
}

export async function removeOldNotifications(days = 30) {
  const res = await fetch(`${API_URL}/cleanup/old?days=${days}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erreur suppression anciennes notifications');
  return res.json();
} 