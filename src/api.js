const API_BASE = 'https://photo-display-api.brandonlhd.workers.dev';

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '登录失败');
  return data.token;
}

export async function fetchPhotos(token) {
  const res = await fetch(`${API_BASE}/api/photos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '获取照片失败');
  return data.photos;
}
