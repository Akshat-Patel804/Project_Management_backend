import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const ACCESS_KEY = "pc_access_token";
const REFRESH_KEY = "pc_refresh_token";

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// The backend sets httpOnly cookies AND returns tokens in the body,
// so we send both (withCredentials + Bearer header).
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;
let onAuthFailure = () => {};
export const setAuthFailureHandler = (fn) => {
  onAuthFailure = fn;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes("/auth/refresh-token") || original?.url?.includes("/auth/login");

    if (status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise ??= axios
          .post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken: tokenStore.refresh }, { withCredentials: true })
          .then((r) => tokenStore.set(r.data?.data || {}))
          .finally(() => {
            refreshPromise = null;
          });
        await refreshPromise;
        return api(original);
      } catch {
        tokenStore.clear();
        onAuthFailure();
      }
    }
    return Promise.reject(error);
  },
);

// Backend wraps everything in ApiResponse { statusCode, data, message, success }
export const unwrap = (res) => res.data?.data;

export const getErrorMessage = (err) => {
  const body = err?.response?.data;
  if (body?.error && Array.isArray(body.error) && body.error.length) {
    return body.error.map((e) => Object.values(e).join(", ")).join("; ");
  }
  if (body?.message) return body.message;
  if (typeof body === "string" && body.length < 300) return body;
  return err?.message || "Something went wrong";
};

export default api;
