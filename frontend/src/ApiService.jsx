const API_BASE = "http://localhost:8080/api";

const ApiService = () => {
  const request = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token");
      const isFormData = options.body instanceof FormData;

      const config = {
        ...options,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
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
      console.error("API Error:", err);
      throw err;
    }
  };

  // ================= AUTH =================
  const login = (credentials) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });

  const register = (userData) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(userData) });

  const logout = () => request("/auth/logout", { method: "POST" });
  const refreshToken = () => request("/auth/refresh");

  // ================= PROFILE =================
  const getProfile = () => request("/profile");
  const updateProfile = (profileData) =>
    request("/profile", { method: "PUT", body: JSON.stringify(profileData) });

  // ================= WISHLISTS =================
  const getWishlists = () => request("/wishlists");
  const getWishlist = (id) => request(`/wishlists/${id}`); // ✅ исправлено
  const createWishlist = (data) =>
    request("/wishlists", { method: "POST", body: JSON.stringify(data) });
  const updateWishlist = (id, data) =>
    request(`/wishlists/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const deleteWishlist = (id) => request(`/wishlists/${id}`, { method: "DELETE" });

  // ================= ITEMS =================
  const getWishlistItems = (listId) => request(`/wishlists/${listId}/items`); // ✅ переименовал логично
  const createWishlistItem = (listId, data) =>
    request(`/wishlists/${listId}/items`, { method: "POST", body: JSON.stringify(data) });
  const updateWishlistItem = (listId, itemId, data) =>
    request(`/wishlists/${listId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(data) });
  const deleteWishlistItem = (listId, itemId) =>
    request(`/wishlists/${listId}/items/${itemId}`, { method: "DELETE" });

  // ================= USERS (ADMIN-ish) =================
  const getUsers = () => request("/users");
  const createUser = (data) => request("/users", { method: "POST", body: JSON.stringify(data) });
  const updateUser = (id, data) => request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const deleteUser = (id) => request(`/users/${id}`, { method: "DELETE" });

  // ================= UPLOAD =================
  const uploadImage = (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return request("/upload", { method: "POST", body: formData, headers: {} });
  };

  // ================= SEARCH =================
  const searchWishlists = (query) => request(`/wishlists/search?q=${encodeURIComponent(query)}`);

  // ================= USERS PUBLIC =================
  const getUser = (login) => request(`/users/${login}`);
  const getUserWishlists = (login) => request(`/users/${login}/wishlists`);

  // ✅ Добавлено: items публичного вишлиста (по JWT, как на беке)
  const getUserWishlistItems = (login, listId) =>
    request(`/users/${login}/wishlists/${listId}/items`);

  // ================= RESERVATIONS & CONTRIBUTIONS =================
  const reserveItem = (itemId) => request(`/items/${itemId}/reserve`, { method: "POST" });
  const unreserveItem = (itemId) => request(`/items/${itemId}/reserve`, { method: "DELETE" });

  // ✅ Исправлено: путь + метод (бек ждёт PUT /contribution)
  const contributeToItem = (itemId, amountCents) =>
    request(`/items/${itemId}/contribution`, {
      method: "PUT",
      body: JSON.stringify({ amountCents }),
    });

  const deleteMyContribution = (itemId) =>
    request(`/items/${itemId}/contribution`, { method: "DELETE" });

  return {
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

    getWishlistItems,
    createWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,

    getUsers,
    createUser,
    updateUser,
    deleteUser,

    uploadImage,
    searchWishlists,

    getUser,
    getUserWishlists,
    getUserWishlistItems,

    reserveItem,
    unreserveItem,
    contributeToItem,
    deleteMyContribution,
  };
};

export default ApiService;
