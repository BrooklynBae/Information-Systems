import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:8080/api';

const ApiService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const request = useCallback(async (endpoint, options = {}) => {
        setLoading(true);
        setError('');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                credentials: 'include', // cookies/JWT
                ...options,
            };

            const response = await fetch(`${API_BASE}${endpoint}`, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            setError(err.message);
            console.error('API Error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (credentials) => {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }, [request]);

    const register = useCallback(async (userData) => {
        return request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }, [request]);

    const logout = useCallback(async () => {
        return request('/auth/logout', { method: 'POST' });
    }, [request]);

    const refreshToken = useCallback(async () => {
        return request('/auth/refresh');
    }, [request]);

    const getProfile = useCallback(() => {
        return request('/profile');
    }, [request]);

    const updateProfile = useCallback(async (profileData) => {
        return request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }, [request]);

    const getWishlists = useCallback(() => {
        return request('/wishlists');
    }, [request]);

    const getWishlist = useCallback((id) => {
        return request(`/wishlists/${id}`);
    }, [request]);

    const createWishlist = useCallback(async (wishlistData) => {
        return request('/wishlists', {
            method: 'POST',
            body: JSON.stringify(wishlistData),
        });
    }, [request]);

    const updateWishlist = useCallback(async (id, wishlistData) => {
        return request(`/wishlists/${id}`, {
            method: 'PUT',
            body: JSON.stringify(wishlistData),
        });
    }, [request]);

    const deleteWishlist = useCallback(async (id) => {
        return request(`/wishlists/${id}`, { method: 'DELETE' });
    }, [request]);

    const createWishlistItem = useCallback(async (wishlistId, itemData) => {
        return request(`/wishlists/${wishlistId}/items`, {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
    }, [request]);

    const getWishlistItem = useCallback((wishlistId, itemId) => {
        return request(`/wishlists/${wishlistId}/items/${itemId}`);
    }, [request]);

    const updateWishlistItem = useCallback(async (wishlistId, itemId, itemData) => {
        return request(`/wishlists/${wishlistId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(itemData),
        });
    }, [request]);

    const deleteWishlistItem = useCallback(async (wishlistId, itemId) => {
        return request(`/wishlists/${wishlistId}/items/${itemId}`, {
            method: 'DELETE'
        });
    }, [request]);

    const getUsers = useCallback(() => {
        return request('/users');
    }, [request]);

    const createUser = useCallback(async (userData) => {
        return request('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }, [request]);

    const updateUser = useCallback(async (id, userData) => {
        return request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }, [request]);

    const deleteUser = useCallback(async (id) => {
        return request(`/users/${id}`, { method: 'DELETE' });
    }, [request]);

    const uploadImage = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        return request('/upload', {
            method: 'POST',
            body: formData,
            headers: {},
        });
    }, [request]);

    const searchWishlists = useCallback(async (query) => {
        return request(`/wishlists/search?q=${encodeURIComponent(query)}`);
    }, [request]);

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
