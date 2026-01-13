const API_BASE = "http://localhost:8080/api";

const ApiService = () => {
  const request = async (endpoint, options = {}) => {
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

  // ================= WISHLISTS (МОИ) =================
  const getWishlists = () => request("/wishlists");

  // wishlist meta (если бэк отдаёт)
  const getWishlist = (id) => request(`/wishlists/${id}`);

  // items конкретного wishlist
  const getWishlistItems = (listId) => request(`/wishlists/${listId}/items`);

  const createWishlist = (data) =>
    request("/wishlists", { method: "POST", body: JSON.stringify(data) });

  const updateWishlist = (id, data) =>
    request(`/wishlists/${id}`, { method: "PUT", body: JSON.stringify(data) });

  const deleteWishlist = (id) => request(`/wishlists/${id}`, { method: "DELETE" });

  // ================= ITEMS (МОИ) =================
  const createWishlistItem = (listId, data) =>
    request(`/wishlists/${listId}/items`, { method: "POST", body: JSON.stringify(data) });

  const updateWishlistItem = (listId, itemId, data) =>
    request(`/wishlists/${listId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

  const deleteWishlistItem = (listId, itemId) =>
    request(`/wishlists/${listId}/items/${itemId}`, { method: "DELETE" });

  // ================= SEARCH =================
  const searchWishlists = (query) =>
    request(`/wishlists/search?q=${encodeURIComponent(query)}`);

  // ================= USERS PUBLIC =================
  const getUser = (login) => request(`/users/${login}`);
  const getUserWishlists = (login) => request(`/users/${login}/wishlists`);

  // ВОТ ЭТО НУЖНО ДЛЯ ОТКРЫТИЯ ЧУЖОГО ВИШЛИСТА
  const getUserWishlistItems = (login, listId) =>
    request(`/users/${login}/wishlists/${listId}/items`);

  // ================= RESERVATIONS =================
  const reserveItem = (itemId) => request(`/items/${itemId}/reserve`, { method: "POST" });

  const contributeToItem = (itemId, amountCents) =>
    request(`/items/${itemId}/contribute`, {
      method: "POST",
      body: JSON.stringify({ amountCents }),
    });

  return {
    request,

    // AUTH
    login,
    register,
    logout,
    refreshToken,

    // PROFILE
    getProfile,
    updateProfile,

    // MY WISHLISTS
    getWishlists,
    getWishlist,
    getWishlistItems,
    createWishlist,
    updateWishlist,
    deleteWishlist,

    // MY ITEMS
    createWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,

    // SEARCH
    searchWishlists,

    // PUBLIC
    getUser,
    getUserWishlists,
    getUserWishlistItems,

    // RESERVATIONS
    reserveItem,
    contributeToItem,
  };
};

export default ApiService;
