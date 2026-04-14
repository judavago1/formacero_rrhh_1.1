const buildApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:3001/api";
  }

  const { protocol, hostname, host } = window.location;

  if (/github\.dev$|githubpreview\.dev$/.test(host)) {
    const apiHost = host.replace(/-\d+(?=\.app\.)/, "-3001");
    return `${protocol}//${apiHost}/api`;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:3001/api`;
  }

  return `${protocol}//${hostname}:3001/api`;
};

export const API = buildApiUrl();

export const getAuthHeaders = (customHeaders = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  return fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(options.headers)
    }
  });
};
