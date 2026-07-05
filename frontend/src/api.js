export const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api';
export const API = (path) => `${API_BASE_URL}${path}`;
