const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function apiClient<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  
  // Ensure headers are properly set
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `API call failed: ${response.status}`);
  }

  return response.json();
}
