const API_URL = 'http://localhost:5001/api/incidents';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getIncidents() {
  const res = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement incidents');
  return res.json();
}

export async function getIncident(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement incident');
  return res.json();
}

export async function createIncident(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création incident');
  return res.json();
}

export async function updateIncident(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur modification incident');
  return res.json();
}

export async function removeIncident(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erreur suppression incident');
  return res.json();
} 