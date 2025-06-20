const API_URL = 'http://localhost:5001/api/drivers';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getDrivers() {
  const res = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement conducteurs');
  return res.json();
}

export async function getDriver(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement conducteur');
  return res.json();
}

export async function createDriver(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création conducteur');
  return res.json();
}

export async function updateDriver(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur modification conducteur');
  return res.json();
}

export async function removeDriver(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erreur suppression conducteur');
  return res.json();
} 