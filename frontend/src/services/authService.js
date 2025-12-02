const API_GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084';
const AUTH_BASE_URL = `${API_GATEWAY_URL}/api/auth`;

const parseResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      data?.detail ||
      `Requête échouée avec le statut ${response.status}`;
    throw new Error(message);
  }
  return data;
};

export const setSession = (payload) => {
  if (!payload) return;
  localStorage.setItem('authToken', payload.accessToken);
  localStorage.setItem('refreshToken', payload.refreshToken);
  localStorage.setItem(
    'authUser',
    JSON.stringify({
      id: payload.userId,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
    })
  );
};

export const clearSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('authUser');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (email, password) => {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseResponse(response);
  setSession(data);
  return data;
};

export const loginWithGoogle = async (credential) => {
  const response = await fetch(`${AUTH_BASE_URL}/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  const data = await parseResponse(response);
  setSession(data);
  return data;
};

export const register = async (payload) => {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  setSession(data);
  return data;
};

export const fetchProfile = async () => {
  const response = await fetch(`${AUTH_BASE_URL}/me`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  return parseResponse(response);
};

export const logout = () => {
  clearSession();
  localStorage.removeItem('aiCallsCount');
};

