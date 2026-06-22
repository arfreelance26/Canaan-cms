import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.canaanglobalinternational.com',
});

api.interceptors.request.use((config) => {
  // Ensure the request hits the /api routing prefix of the backend
  if (config.url && config.url.startsWith('/')) {
    // We don't want double slashes if url already starts with a slash
    config.url = `/api${config.url}`;
  }

  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not reload the page if the 401 Unauthorized is coming from a failed login attempt
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('auth/login');
      
      if (!isLoginRequest) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('cms_auth');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
