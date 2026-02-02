// ===== CONFIGURATION API =====
const API_URL = 'https://forkshop-api.onrender.com/api';

// ===== ÉTAT GLOBAL API =====
// NOTE: On ne redéclare PAS cart, wishlist, etc. car script.js les déclare déjà
// On utilise les variables globales de script.js (window.cart, window.wishlist, etc.)
let currentUser = null;
let authToken = localStorage.getItem('authToken') || null;
let appliedPromo = null;

// Codes promo valides (maintenant aussi côté client pour validation)
const promoCodes = {
    "FORK10": { discount: 10, type: "percentage" },
    "WELCOME5": { discount: 5, type: "fixed" },
    "SAVE20": { discount: 20, type: "percentage" }
};

// ===== FONCTIONS API =====

// Fonction helper pour les requêtes API
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Ajouter le token si disponible
    if (authToken && !options.noAuth) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erreur serveur');
        }

        return data;
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// ===== AUTHENTIFICATION =====

async function login(email, password) {
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showNotification('Connexion réussie !');

        // Charger les données utilisateur
        await loadUserData();

        return data;
    } catch (error) {
        showNotification('Erreur de connexion : ' + error.message, 'error');
        throw error;
    }
}

async function register(userData) {
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showNotification('Inscription réussie !');
        await loadUserData();

        return data;
    } catch (error) {
        showNotification('Erreur d\'inscription : ' + error.message, 'error');
        throw error;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    cart = [];
    wishlist = [];
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    showNotification('Déconnexion réussie');
    updateUIAfterLogout();
}

async function verifyToken() {
    if (!authToken) return false;

    try {
        const data = await apiRequest('/auth/verify');
        currentUser = data.user;
        return true;
    } catch (error) {
        // Token invalide
        logout();
        return false;
    }
}

// ===== PRODUITS =====

async function fetchProducts() {
    try {
        let endpoint = '/products?';
        const params = [];

        // Utiliser les variables globales de script.js
        const filter = window.currentFilter || 'all';
        const search = window.searchQuery || '';
        const sort = window.currentSort || 'default';

        if (filter !== 'all') {
            params.push(`category=${filter}`);
        }
        if (search) {
            params.push(`search=${encodeURIComponent(search)}`);
        }
        if (sort !== 'default') {
            params.push(`sort=${sort}`);
        }

        endpoint += params.join('&');

        const data = await apiRequest(endpoint, { noAuth: true });

        // Mettre à jour la variable globale products de script.js
        if (typeof window.products !== 'undefined') {
            window.products = data.products;
        }

        // Appeler displayProducts de script.js (sans paramètres)
        if (typeof window.displayProducts === 'function') {
            window.displayProducts();
        }

        return data.products;
    } catch (error) {
        console.error('Erreur chargement produits API:', error);
        showNotification('Erreur lors du chargement des produits', 'error');
        return [];
    }
}

// ===== PANIER =====

async function loadCart() {
    if (!authToken) {
        // Mode déconnecté : utiliser localStorage
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        updateCartCount();
        return cart;
    }

    try {
        const data = await apiRequest('/cart');
        cart = data.cart.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            icon: item.icon,
            category: item.category,
            quantity: item.quantity
        }));
        updateCartCount();
        return cart;
    } catch (error) {
        console.error('Erreur chargement panier:', error);
        return [];
    }
}

async function addToCart(productId) {
    if (!authToken) {
        // Mode déconnecté : localStorage
        showNotification('Connectez-vous pour ajouter au panier', 'error');
        openLoginModal();
        return;
    }

    try {
        await apiRequest('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity: 1 })
        });

        await loadCart();
        showNotification('Produit ajouté au panier !');
    } catch (error) {
        showNotification('Erreur : ' + error.message, 'error');
    }
}

async function removeFromCart(productId) {
    if (!authToken) return;

    try {
        await apiRequest(`/cart/${productId}`, {
            method: 'DELETE'
        });

        await loadCart();
        displayCart();
    } catch (error) {
        showNotification('Erreur : ' + error.message, 'error');
    }
}

async function updateCartQuantity(productId, quantity) {
    if (!authToken) return;

    try {
        await apiRequest(`/cart/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });

        await loadCart();
        displayCart();
    } catch (error) {
        showNotification('Erreur : ' + error.message, 'error');
    }
}

// ===== WISHLIST =====

async function loadWishlist() {
    if (!authToken) {
        wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        updateWishlistCount();
        return wishlist;
    }

    try {
        const data = await apiRequest('/wishlist');
        wishlist = data.wishlist;
        updateWishlistCount();
        return wishlist;
    } catch (error) {
        console.error('Erreur chargement wishlist:', error);
        return [];
    }
}

async function toggleWishlist(productId) {
    if (!authToken) {
        showNotification('Connectez-vous pour ajouter aux favoris', 'error');
        openLoginModal();
        return;
    }

    const isInWishlist = wishlist.some(item => item.id === productId || item.productId === productId);

    try {
        if (isInWishlist) {
            await apiRequest(`/wishlist/${productId}`, {
                method: 'DELETE'
            });
            showNotification('Retiré des favoris');
        } else {
            await apiRequest('/wishlist/add', {
                method: 'POST',
                body: JSON.stringify({ productId })
            });
            showNotification('Ajouté aux favoris');
        }

        await loadWishlist();
        await fetchProducts(); // Rafraîchir l'affichage
    } catch (error) {
        showNotification('Erreur : ' + error.message, 'error');
    }
}

// ===== COMMANDES =====

async function createOrder(orderData) {
    if (!authToken) {
        showNotification('Connectez-vous pour passer commande', 'error');
        return;
    }

    try {
        const data = await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        showNotification('Commande créée avec succès ! 🎉');

        // Recharger le panier (qui devrait être vide maintenant)
        await loadCart();

        return data.order;
    } catch (error) {
        showNotification('Erreur lors de la commande : ' + error.message, 'error');
        throw error;
    }
}

async function loadOrders() {
    if (!authToken) return [];

    try {
        const data = await apiRequest('/orders');
        return data.orders;
    } catch (error) {
        console.error('Erreur chargement commandes:', error);
        return [];
    }
}

// ===== CHARGEMENT DES DONNÉES UTILISATEUR =====

async function loadUserData() {
    if (!authToken) return;

    await Promise.all([
        loadCart(),
        loadWishlist()
    ]);

    updateUIAfterLogin();
}

// ===== UI UPDATES =====

function updateUIAfterLogin() {
    // Mettre à jour l'interface pour afficher que l'utilisateur est connecté
    const authSection = document.querySelector('.header-actions');
    if (authSection && currentUser) {
        // Ajouter un indicateur de connexion
        const userIndicator = document.createElement('div');
        userIndicator.className = 'user-indicator';
        userIndicator.innerHTML = `
            <span>👤 ${currentUser.firstName}</span>
            <button onclick="logout()" class="logout-btn">Déconnexion</button>
        `;
        userIndicator.style.cssText = 'display: flex; align-items: center; gap: 10px; font-size: 0.9rem;';

        // Insérer avant les icônes
        authSection.insertBefore(userIndicator, authSection.firstChild);
    }
}

function updateUIAfterLogout() {
    // Retirer l'indicateur de connexion
    const userIndicator = document.querySelector('.user-indicator');
    if (userIndicator) {
        userIndicator.remove();
    }

    // Réinitialiser les compteurs
    updateCartCount();
    updateWishlistCount();
}

// ===== MODALS DE CONNEXION/INSCRIPTION =====

function openLoginModal() {
    // Créer un modal de connexion simple
    const existingModal = document.getElementById('login-modal');
    if (existingModal) {
        existingModal.style.display = 'block';
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeLoginModal()">&times;</span>
            <h2>Connexion</h2>
            <form id="login-form" onsubmit="handleLogin(event)">
                <input type="email" id="login-email" placeholder="Email" required>
                <input type="password" id="login-password" placeholder="Mot de passe" required>
                <button type="submit" class="cta-button">Se connecter</button>
            </form>
            <p style="text-align: center; margin-top: 1rem;">
                Pas encore de compte ? <a href="#" onclick="openRegisterModal()">S'inscrire</a>
            </p>
            <p style="text-align: center; color: #666; font-size: 0.9rem; margin-top: 1rem;">
                <strong>Compte de test :</strong><br>
                Email: test@forkshop.fr<br>
                Mot de passe: password123
            </p>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openRegisterModal() {
    closeLoginModal();

    const modal = document.createElement('div');
    modal.id = 'register-modal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeRegisterModal()">&times;</span>
            <h2>Inscription</h2>
            <form id="register-form" onsubmit="handleRegister(event)">
                <input type="text" id="register-firstName" placeholder="Prénom" required>
                <input type="text" id="register-lastName" placeholder="Nom" required>
                <input type="email" id="register-email" placeholder="Email" required>
                <input type="tel" id="register-phone" placeholder="Téléphone (optionnel)">
                <input type="password" id="register-password" placeholder="Mot de passe" required minlength="6">
                <button type="submit" class="cta-button">S'inscrire</button>
            </form>
            <p style="text-align: center; margin-top: 1rem;">
                Déjà un compte ? <a href="#" onclick="openLoginModal()">Se connecter</a>
            </p>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.remove();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await login(email, password);
        closeLoginModal();
        await fetchProducts();
    } catch (error) {
        // L'erreur est déjà gérée dans la fonction login
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const userData = {
        firstName: document.getElementById('register-firstName').value,
        lastName: document.getElementById('register-lastName').value,
        email: document.getElementById('register-email').value,
        phone: document.getElementById('register-phone').value,
        password: document.getElementById('register-password').value
    };

    try {
        await register(userData);
        closeRegisterModal();
        await fetchProducts();
    } catch (error) {
        // L'erreur est déjà gérée dans la fonction register
    }
}

// ===== ADAPTATION DU CHECKOUT =====

async function handleCheckoutSubmitAPI(e) {
    e.preventDefault();

    if (!authToken) {
        showNotification('Connectez-vous pour passer commande', 'error');
        return;
    }

    const formData = new FormData(e.target);

    // Préparer les données de commande
    const orderData = {
        items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        discount: 0,
        total: 0,
        promoCode: null,
        paymentMethod: formData.get('payment'),
        shippingAddress: {
            address: formData.get('address'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode'),
            country: formData.get('country')
        }
    };

    // Appliquer la réduction si code promo
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            orderData.discount = orderData.subtotal * (appliedPromo.discount / 100);
        } else {
            orderData.discount = appliedPromo.discount;
        }
        orderData.promoCode = appliedPromo.code;
    }

    orderData.total = orderData.subtotal - orderData.discount;

    try {
        await createOrder(orderData);
        closeModal('checkout-modal');

        // Afficher un message de remerciement
        setTimeout(() => {
            showNotification('Merci pour votre commande ! 🎉', 'success');
        }, 500);
    } catch (error) {
        // L'erreur est déjà gérée
    }
}

// ===== INITIALISATION =====

document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier le token au démarrage
    if (authToken) {
        const isValid = await verifyToken();
        if (isValid) {
            await loadUserData();
        }
    }

    // Charger les produits depuis l'API backend
    await fetchProducts();

    // Remplacer le gestionnaire de checkout
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.removeEventListener('submit', handleCheckoutSubmit);
        checkoutForm.addEventListener('submit', handleCheckoutSubmitAPI);
    }

    // Ajouter le style CSS pour les nouveaux éléments
    addAuthStyles();
});

// Ajouter les styles pour les modals de connexion
function addAuthStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #login-modal input,
        #register-modal input {
            width: 100%;
            padding: 0.8rem;
            margin-bottom: 1rem;
            border: 2px solid var(--border-color);
            border-radius: 10px;
            font-size: 1rem;
            background-color: var(--bg-color);
            color: var(--text-color);
        }

        #login-modal input:focus,
        #register-modal input:focus {
            outline: none;
            border-color: var(--secondary-color);
        }

        #login-modal a,
        #register-modal a {
            color: var(--secondary-color);
            text-decoration: none;
            font-weight: 600;
        }

        #login-modal a:hover,
        #register-modal a:hover {
            text-decoration: underline;
        }

        .logout-btn {
            background-color: var(--accent-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: var(--transition);
        }

        .logout-btn:hover {
            background-color: #c0392b;
        }
    `;
    document.head.appendChild(style);
}

// Exporter les fonctions pour qu'elles soient accessibles globalement
window.login = login;
window.logout = logout;
window.register = register;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
