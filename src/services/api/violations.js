const API_URL = 'http://localhost:5001/api/violations';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getViolations() {
  const res = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement violations');
  return res.json();
}

export async function getViolation(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erreur chargement violation');
  return res.json();
}

export async function createViolation(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création violation');
  return res.json();
}

export async function updateViolation(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur modification violation');
  return res.json();
}

export async function removeViolation(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erreur suppression violation');
  return res.json();
} 