// ===== FORKSHOP API MODULE =====
// Module propre pour communiquer avec le backend sans conflits

const ForkShopAPI = (function() {
    'use strict';

    // Configuration
    const API_URL = 'https://forkshop-api.onrender.com/api';

    // État de l'authentification
    let authToken = localStorage.getItem('forkshop_auth_token') || null;
    let currentUser = null;

    // ===== HELPERS =====

    async function apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (authToken && !options.noAuth) {
            defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
        }

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur API');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ===== PRODUITS =====

    async function fetchProducts(filters = {}) {
        const params = new URLSearchParams();

        if (filters.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.sort && filters.sort !== 'default') {
            params.append('sort', filters.sort);
        }

        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';

        const data = await apiRequest(endpoint, { noAuth: true });
        return data.products || [];
    }

    async function getProduct(id) {
        const data = await apiRequest(`/products/${id}`, { noAuth: true });
        return data.product;
    }

    // ===== AUTHENTIFICATION =====

    async function login(email, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            noAuth: true
        });

        if (data.success && data.token) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('forkshop_auth_token', authToken);
            return { success: true, user: data.user };
        }

        throw new Error(data.message || 'Login failed');
    }

    async function register(userData) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            noAuth: true
        });

        if (data.success && data.token) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('forkshop_auth_token', authToken);
            return { success: true, user: data.user };
        }

        throw new Error(data.message || 'Registration failed');
    }

    function logout() {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('forkshop_auth_token');
    }

    async function verifyToken() {
        if (!authToken) return false;

        try {
            const data = await apiRequest('/auth/verify');
            if (data.success) {
                currentUser = data.user;
                return true;
            }
        } catch (error) {
            logout();
            return false;
        }
        return false;
    }

    // ===== PANIER =====

    async function getCart() {
        if (!authToken) return [];
        const data = await apiRequest('/cart');
        return data.cart || [];
    }

    async function addToCart(productId, quantity = 1) {
        if (!authToken) {
            throw new Error('Vous devez être connecté pour ajouter au panier');
        }
        const data = await apiRequest('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        return data;
    }

    async function updateCartItem(productId, quantity) {
        const data = await apiRequest(`/cart/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
        return data;
    }

    async function removeFromCart(productId) {
        const data = await apiRequest(`/cart/${productId}`, {
            method: 'DELETE'
        });
        return data;
    }

    // ===== WISHLIST =====

    async function getWishlist() {
        if (!authToken) return [];
        const data = await apiRequest('/wishlist');
        return data.wishlist || [];
    }

    async function addToWishlist(productId) {
        const data = await apiRequest('/wishlist/add', {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
        return data;
    }

    async function removeFromWishlist(productId) {
        const data = await apiRequest(`/wishlist/${productId}`, {
            method: 'DELETE'
        });
        return data;
    }

    // ===== COMMANDES =====

    async function createOrder(orderData) {
        const data = await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        return data;
    }

    async function getOrders() {
        const data = await apiRequest('/orders');
        return data.orders || [];
    }

    async function getOrder(id) {
        const data = await apiRequest(`/orders/${id}`);
        return data.order;
    }

    // ===== AVIS =====

    async function getProductReviews(productId) {
        const data = await apiRequest(`/reviews/product/${productId}`, { noAuth: true });
        return data.reviews || [];
    }

    async function addReview(productId, rating, comment) {
        const data = await apiRequest('/reviews', {
            method: 'POST',
            body: JSON.stringify({ productId, rating, comment })
        });
        return data;
    }

    // ===== FIDÉLITÉ =====

    async function getLoyaltyPoints() {
        const data = await apiRequest('/loyalty/points');
        return data;
    }

    async function redeemPoints(points) {
        const data = await apiRequest('/loyalty/redeem', {
            method: 'POST',
            body: JSON.stringify({ pointsToRedeem: points })
        });
        return data;
    }

    // ===== TRACKING =====

    async function trackOrder(trackingNumber) {
        const data = await apiRequest(`/tracking/${trackingNumber}`, { noAuth: true });
        return data;
    }

    // ===== API PUBLIQUE =====

    return {
        // Produits
        fetchProducts,
        getProduct,

        // Auth
        login,
        register,
        logout,
        verifyToken,
        isAuthenticated: () => !!authToken,
        getCurrentUser: () => currentUser,

        // Panier
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,

        // Wishlist
        getWishlist,
        addToWishlist,
        removeFromWishlist,

        // Commandes
        createOrder,
        getOrders,
        getOrder,

        // Avis
        getProductReviews,
        addReview,

        // Fidélité
        getLoyaltyPoints,
        redeemPoints,

        // Tracking
        trackOrder
    };
})();

// Rendre disponible globalement
window.ForkShopAPI = ForkShopAPI;
