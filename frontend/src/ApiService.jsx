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
  const login = (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
  const register = (userData) => request("/auth/register", { method: "POST", body: JSON.stringify(userData) });
  const logout = () => request("/auth/logout", { method: "POST" });
  const refreshToken = () => request("/auth/refresh");

  // ================= PROFILE =================
  const getProfile = () => request("/profile");
  const updateProfile = (profileData) => request("/profile", { method: "PUT", body: JSON.stringify(profileData) });

  // ================= WISHLISTS =================
  const getWishlists = () => request("/wishlists");
  const getWishlist = (id) => request(`/wishlists/${id}/items`);
  const createWishlist = (data) => request("/wishlists/${id}/items", { method: "POST", body: JSON.stringify(data) });
  const updateWishlist = (id, data) => request(`/wishlists/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const deleteWishlist = (id) => request(`/wishlists/${id}`, { method: "DELETE" });

  // ================= ITEMS =================
  const getWishlistItem = (listId) => request(`/wishlists/${listId}/items`);
  const createWishlistItem = (listId, data) => request(`/wishlists/${listId}/items`, { method: "POST", body: JSON.stringify(data) });
  const updateWishlistItem = (listId, itemId, data) => request(`/wishlists/${listId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(data) });
  const deleteWishlistItem = (listId, itemId) => request(`/wishlists/${listId}/items/${itemId}`, { method: "DELETE" });

  // ================= USERS =================
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


  // ================= RESERVATIONS =================
  const reserveItem = (itemId) => request(`/items/${itemId}/reserve`, { method: "POST" }); // эндпоинт бронирования
  const contributeToItem = (itemId, amountCents) =>
      request(`/items/${itemId}/contribute`, { method: "POST", body: JSON.stringify({ amountCents }) });

  return {
    // AUTH
    login,
    register,
    logout,
    refreshToken,

    // PROFILE
    getProfile,
    updateProfile,

    // WISHLISTS
    getWishlists,
    getWishlist,
    createWishlist,
    updateWishlist,
    deleteWishlist,

    // ITEMS
    getWishlistItem,
    createWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,

    // USERS
    getUsers,
    createUser,
    updateUser,
    deleteUser,

    // UPLOAD
    uploadImage,

    // SEARCH
    searchWishlists,

    // USERS PUBLIC
    getUser,
    getUserWishlists,

    reserveItem,
    contributeToItem
  };
};

export default ApiService;
