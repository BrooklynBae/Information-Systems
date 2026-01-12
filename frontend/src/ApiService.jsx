import { useState, useCallback } from "react";

const API_BASE = "http://localhost:8080/api";

const ApiService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const isFormData = options.body instanceof FormData;

      const config = {
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${API_BASE}${endpoint}`, config);

      const contentType = response.headers.get("content-type") || "";
      const hasJson = contentType.includes("application/json");

      if (!response.ok) {
        const errorData = hasJson ? await response.json().catch(() => ({})) : {};
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return hasJson ? await response.json() : null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials), // {login, password}
      }),
    [request]
  );

  const register = useCallback(
    async (userData) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData), // {login,email,password}
      }),
    [request]
  );

  const getProfile = useCallback(() => request("/profile"), [request]);

  return { loading, error, login, register, getProfile };
};

export default ApiService;
