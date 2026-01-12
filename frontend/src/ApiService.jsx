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
        ...options,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),

          // JWT из localStorage
          ...(token ? { Authorization: `Bearer ${token}` } : {}),

          // пользовательские заголовки поверх
          ...(options.headers || {}),
        },
        // credentials нужны только если используешь cookie.
        // Пока у нас Bearer JWT — можно не ставить, но оставим:
        credentials: "include",
      };

      const response = await fetch(`${API_BASE}${endpoint}`, config);

      // аккуратно читаем ответ
      const contentType = response.headers.get("content-type") || "";
      const hasJson = contentType.includes("application/json");

      if (!response.ok) {
        const errorData = hasJson ? await response.json().catch(() => ({})) : {};
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return hasJson ? await response.json() : null;
    } catch (err) {
      setError(err.message || "API Error");
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // AUTH
  const login = useCallback(
    async (credentials) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials), // { login, password } (или { email, password } если поменяешь)
      }),
    [request]
  );

  const register = useCallback(
    async (userData) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData), // { login, email, password }
      }),
    [request]
  );

  const logout = useCallback(async () => {
    return request("/auth/logout", { method: "POST" });
  }, [request]);

  const refreshToken = useCallback(async () => {
    return request("/auth/refresh");
  }, [request]);

  // PROFILE
  const getProfile = useCallback(() => {
    return request("/profile");
  }, [request]);

  const updateProfile = useCallback(
    async (profileData) => {
      return request("/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });
    },
    [request]
  );

  // WISHLISTS
  const getWishlists = useCallback(() => {
    return request("/wishlists");
  }, [request]);

  const getWishlist = useCallback(
    (id) => {
      return request(`/wishlists/${id}`);
    },
    [request]
  );

  const createWishlist = useCallback(
    async (wishlistData) => {
      return request("/wishlists", {
        method: "POST",
        body: JSON.stringify(wishlistData),
      });
    },
    [request]
  );

  const updateWishlist = useCallback(
    async (id, wishlistData) => {
      return request(`/wishlists/${id}`, {
        method: "PUT",
        body: JSON.stringify(wishlistData),
      });
    },
    [request]
  );

  const deleteWishlist = useCallback(
    async (id) => {
      return request(`/wishlists/${id}`, { method: "DELETE" });
    },
    [request]
  );

  // ITEMS
  const createWishlistItem = useCallback(
    async (wishlistId, itemData) => {
      return request(`/wishlists/${wishlistId}/items`, {
        method: "POST",
        body: JSON.stringify(itemData),
      });
    },
    [request]
  );

  const getWishlistItem = useCallback((wishlistId) => {
    return request(`/wishlists/${wishlistId}/items`);
  }, [request]);


  const updateWishlistItem = useCallback(
    async (wishlistId, itemId, itemData) => {
      return request(`/wishlists/${wishlistId}/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(itemData),
      });
    },
    [request]
  );

  const deleteWishlistItem = useCallback(
    async (wishlistId, itemId) => {
      return request(`/wishlists/${wishlistId}/items/${itemId}`, {
        method: "DELETE",
      });
    },
    [request]
  );

  // USERS
  const getUsers = useCallback(() => {
    return request("/users");
  }, [request]);

  const createUser = useCallback(
    async (userData) => {
      return request("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    [request]
  );

  const updateUser = useCallback(
    async (id, userData) => {
      return request(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    },
    [request]
  );

  const deleteUser = useCallback(
    async (id) => {
      return request(`/users/${id}`, { method: "DELETE" });
    },
    [request]
  );

  // UPLOAD
  const uploadImage = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append("image", file);

      return request("/upload", {
        method: "POST",
        body: formData,
        // headers пустые — чтобы не перетереть multipart
        headers: {},
      });
    },
    [request]
  );

  const searchWishlists = useCallback(
    async (query) => {
      return request(`/wishlists/search?q=${encodeURIComponent(query)}`);
    },
    [request]
  );

  return {
    loading,
    error,

    login,
    register,
    logout,
    refreshToken,

    getProfile,
    updateProfile,

    getWishlists,
    getWishlist,
    createWishlist,
    updateWishlist,
    deleteWishlist,

    createWishlistItem,
    getWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,

    getUsers,
    createUser,
    updateUser,
    deleteUser,

    uploadImage,

    searchWishlists,
  };
};

export default ApiService;