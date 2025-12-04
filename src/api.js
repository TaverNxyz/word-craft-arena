// src/api.js
const API_URL = 'http://72.61.9.200:3001';

export async function loginUser(idToken) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function loadPlayerData(uid, idToken) {
  try {
    const res = await fetch(`${API_URL}/user/${uid}/data`, {
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const json = await res.json();
    return json.data || {};
  } catch (error) {
    console.error('Load error:', error);
    throw error;
  }
}

export async function savePlayerData(uid, data, idToken) {
  try {
    const res = await fetch(`${API_URL}/user/${uid}/data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}
