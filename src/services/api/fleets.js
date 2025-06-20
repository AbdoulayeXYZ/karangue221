const API_URL = 'http://localhost:5001/api/fleets';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getFleets() {
  const res = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement flottes');
  return res.json();
}

export async function getFleet(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement flotte');
  return res.json();
}

export async function createFleet(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création flotte');
  return res.json();
}

export async function updateFleet(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur modification flotte');
  return res.json();
}

export async function removeFleet(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erreur suppression flotte');
  return res.json();
} 