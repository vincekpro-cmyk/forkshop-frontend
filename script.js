// ===== DONNÉES =====

// Produits avec données enrichies
const products = [
    {
        id: 1,
        name: "Fourchette Classic Inox",
        category: "inox",
        price: 12.99,
        description: "Fourchette en acier inoxydable 18/10, design intemporel",
        badge: "Bestseller",
        icon: "🍴",
        rating: 4.5,
        reviewCount: 127,
        material: "Acier inoxydable 18/10",
        weight: "45g",
        length: "20cm",
        popularity: 95,
        images: ["🍴", "✨", "💫"]
    },
    {
        id: 2,
        name: "Fourchette Élégance Argent",
        category: "argent",
        price: 89.99,
        description: "Fourchette en argent massif 925, finition miroir",
        badge: "Premium",
        icon: "✨",
        rating: 5.0,
        reviewCount: 89,
        material: "Argent massif 925",
        weight: "65g",
        length: "21cm",
        popularity: 78,
        images: ["✨", "💎", "⭐"]
    },
    {
        id: 3,
        name: "Fourchette Nature Bois",
        category: "bois",
        price: 24.99,
        description: "Manche en bois d'olivier, dents en inox",
        badge: "Éco",
        icon: "🌿",
        rating: 4.3,
        reviewCount: 56,
        material: "Bois d'olivier + Inox",
        weight: "35g",
        length: "19cm",
        popularity: 65,
        images: ["🌿", "🌳", "🍃"]
    },
    {
        id: 4,
        name: "Fourchette Design Moderne",
        category: "inox",
        price: 18.99,
        description: "Design contemporain, ergonomie optimale",
        badge: null,
        icon: "🍽️",
        rating: 4.7,
        reviewCount: 201,
        material: "Acier inoxydable",
        weight: "50g",
        length: "20.5cm",
        popularity: 88,
        images: ["🍽️", "🔹", "💠"]
    },
    {
        id: 5,
        name: "Fourchette Prestige Argent",
        category: "argent",
        price: 129.99,
        description: "Collection prestige, gravures artisanales",
        badge: "Luxe",
        icon: "👑",
        rating: 4.9,
        reviewCount: 43,
        material: "Argent massif 925",
        weight: "70g",
        length: "22cm",
        popularity: 52,
        images: ["👑", "💍", "✨"]
    },
    {
        id: 6,
        name: "Fourchette Rustique Bois",
        category: "bois",
        price: 19.99,
        description: "Style campagnard, bois de hêtre massif",
        badge: null,
        icon: "🏡",
        rating: 4.2,
        reviewCount: 38,
        material: "Bois de hêtre",
        weight: "40g",
        length: "19.5cm",
        popularity: 58,
        images: ["🏡", "🪵", "🍂"]
    },
    {
        id: 7,
        name: "Fourchette Pro Inox",
        category: "inox",
        price: 15.99,
        description: "Qualité professionnelle, ultra résistante",
        badge: "Pro",
        icon: "⭐",
        rating: 4.8,
        reviewCount: 167,
        material: "Acier inoxydable Pro",
        weight: "55g",
        length: "21cm",
        popularity: 92,
        images: ["⭐", "🔆", "💫"]
    },
    {
        id: 8,
        name: "Fourchette Vintage Argent",
        category: "argent",
        price: 99.99,
        description: "Style rétro, argent patiné",
        badge: "Vintage",
        icon: "🕰️",
        rating: 4.6,
        reviewCount: 72,
        material: "Argent 925 patiné",
        weight: "60g",
        length: "20cm",
        popularity: 70,
        images: ["🕰️", "📜", "🎭"]
    },
    {
        id: 9,
        name: "Fourchette Artisan Bois",
        category: "bois",
        price: 34.99,
        description: "Fait main, bois de noyer sculpté",
        badge: "Artisanal",
        icon: "🎨",
        rating: 4.4,
        reviewCount: 29,
        material: "Bois de noyer",
        weight: "38g",
        length: "19cm",
        popularity: 48,
        images: ["🎨", "🖌️", "🌰"]
    }
];

// Avis clients pour chaque produit
const reviews = {
    1: [
        { name: "Marie D.", rating: 5, text: "Excellent rapport qualité-prix ! Très satisfaite." },
        { name: "Thomas L.", rating: 4, text: "Bonne qualité, design simple et efficace." }
    ],
    2: [
        { name: "Sophie M.", rating: 5, text: "Magnifique ! Un vrai bijou pour ma table." },
        { name: "Pierre B.", rating: 5, text: "Qualité exceptionnelle, je recommande vivement." }
    ],
    3: [
        { name: "Julie R.", rating: 4, text: "Belle finition, très agréable en main." },
        { name: "Marc T.", rating: 4, text: "Original et écologique, j'adore !" }
    ]
};

// Codes promo valides
const promoCodes = {
    "FORK10": { discount: 10, type: "percentage" },
    "WELCOME5": { discount: 5, type: "fixed" },
    "SAVE20": { discount: 20, type: "percentage" }
};

// ===== ÉTAT GLOBAL =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let compareList = [];
let currentFilter = 'all';
let currentSort = 'default';
let currentView = 'grid';
let searchQuery = '';
let appliedPromo = null;

// ===== FONCTIONS UTILITAIRES =====

// Sauvegarder dans localStorage
function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    const theme = document.body.getAttribute('data-theme');
    if (theme) {
        localStorage.setItem('theme', theme);
    }
}

// Générer les étoiles pour les avis
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }
    if (hasHalfStar) {
        stars += '✨';
    }

    return stars;
}

// Afficher une notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ===== AFFICHAGE DES PRODUITS =====

function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    // Filtrer les produits
    let filteredProducts = products.filter(p => {
        const matchesFilter = currentFilter === 'all' || p.category === currentFilter;
        const matchesSearch = searchQuery === '' ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Trier les produits
    filteredProducts = sortProducts(filteredProducts);

    // Appliquer la vue
    if (currentView === 'list') {
        productsGrid.classList.add('list-view');
    } else {
        productsGrid.classList.remove('list-view');
    }

    // Afficher les produits
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = `product-card ${currentView === 'list' ? 'list-view' : ''}`;

        const isInWishlist = wishlist.some(item => item.id === product.id);
        const isInCompare = compareList.includes(product.id);

        productCard.innerHTML = `
            <div class="product-image" onclick="openProductModal(${product.id})">
                <span style="font-size: 5rem;">${product.icon}</span>
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-actions">
                    <button class="wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}"
                            onclick="event.stopPropagation(); toggleWishlist(${product.id})"
                            title="Ajouter aux favoris">
                        ❤️
                    </button>
                    <div class="compare-checkbox-wrapper">
                        <input type="checkbox"
                               class="compare-checkbox"
                               ${isInCompare ? 'checked' : ''}
                               onchange="event.stopPropagation(); toggleCompare(${product.id})"
                               title="Ajouter au comparateur">
                    </div>
                </div>
            </div>
            <div class="product-info">
                <div class="product-rating">
                    <span class="stars">${generateStars(product.rating)}</span>
                    <span class="rating-count">(${product.reviewCount})</span>
                </div>
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                ${currentView === 'list' ? `
                    <div class="product-specs">
                        <div class="spec-item">
                            <span>Matériau:</span>
                            <strong>${product.material}</strong>
                        </div>
                        <div class="spec-item">
                            <span>Poids:</span>
                            <strong>${product.weight}</strong>
                        </div>
                        <div class="spec-item">
                            <span>Longueur:</span>
                            <strong>${product.length}</strong>
                        </div>
                    </div>
                ` : ''}
                <div class="product-footer">
                    <span class="product-price">${product.price.toFixed(2)} €</span>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Ajouter
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 3rem; color: #999;">Aucun produit trouvé.</p>';
    }
}

// Trier les produits
function sortProducts(products) {
    const sorted = [...products];

    switch(currentSort) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'rating-desc':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'popular':
            return sorted.sort((a, b) => b.popularity - a.popularity);
        default:
            return sorted;
    }
}

// ===== PANIER =====

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        saveToLocalStorage();
        showNotification(`${product.name} ajouté au panier !`);
    }
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCartCount();
        displayCart();
        saveToLocalStorage();
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartDiscount = document.getElementById('cart-discount');
    const cartTotal = document.getElementById('cart-total');
    const discountLine = document.getElementById('discount-line');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Votre panier est vide</p>';
        cartSubtotal.textContent = '0.00 €';
        cartTotal.textContent = '0.00';
        discountLine.style.display = 'none';
        return;
    }

    cartItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.icon} ${item.name}</div>
                <div class="cart-item-price">${item.price.toFixed(2)} € × ${item.quantity} = ${itemTotal.toFixed(2)} €</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">Retirer</button>
        `;
        cartItems.appendChild(cartItem);
    });

    // Calculer la réduction
    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            discount = subtotal * (appliedPromo.discount / 100);
        } else {
            discount = appliedPromo.discount;
        }
        discountLine.style.display = 'flex';
        cartDiscount.textContent = `-${discount.toFixed(2)} €`;
    } else {
        discountLine.style.display = 'none';
    }

    const total = subtotal - discount;
    cartSubtotal.textContent = `${subtotal.toFixed(2)} €`;
    cartTotal.textContent = total.toFixed(2);
}

// Code promo
function applyPromoCode() {
    const promoInput = document.getElementById('promo-input');
    const promoMessage = document.getElementById('promo-message');
    const code = promoInput.value.trim().toUpperCase();

    if (promoCodes[code]) {
        appliedPromo = promoCodes[code];
        promoMessage.textContent = `Code "${code}" appliqué avec succès !`;
        promoMessage.className = 'promo-message success';
        displayCart();
    } else {
        promoMessage.textContent = 'Code promo invalide';
        promoMessage.className = 'promo-message error';
        appliedPromo = null;
        displayCart();
    }
}

// ===== WISHLIST =====

function toggleWishlist(productId) {
    const product = products.find(p => p.id === productId);
    const index = wishlist.findIndex(item => item.id === productId);

    if (index !== -1) {
        wishlist.splice(index, 1);
        showNotification(`${product.name} retiré des favoris`);
    } else {
        wishlist.push(product);
        showNotification(`${product.name} ajouté aux favoris`);
    }

    updateWishlistCount();
    saveToLocalStorage();
    displayProducts(); // Rafraîchir pour mettre à jour les icônes
}

function updateWishlistCount() {
    const wishlistCount = document.querySelector('.wishlist-count');
    wishlistCount.textContent = wishlist.length;
}

function displayWishlist() {
    const wishlistItems = document.getElementById('wishlist-items');

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Aucun favori</p>';
        return;
    }

    wishlistItems.innerHTML = '';

    wishlist.forEach(item => {
        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'wishlist-item';
        wishlistItem.innerHTML = `
            <div class="wishlist-item-icon">${item.icon}</div>
            <div class="wishlist-item-info">
                <div class="wishlist-item-name">${item.name}</div>
                <div class="wishlist-item-price">${item.price.toFixed(2)} €</div>
            </div>
            <div class="wishlist-item-actions">
                <button class="add-to-cart" onclick="addToCart(${item.id})">Ajouter au panier</button>
                <button class="remove-item" onclick="toggleWishlist(${item.id})">Retirer</button>
            </div>
        `;
        wishlistItems.appendChild(wishlistItem);
    });
}

// ===== COMPARATEUR =====

function toggleCompare(productId) {
    const index = compareList.indexOf(productId);

    if (index !== -1) {
        compareList.splice(index, 1);
    } else {
        if (compareList.length >= 4) {
            showNotification('Maximum 4 produits pour la comparaison', 'error');
            return;
        }
        compareList.push(productId);
    }

    updateCompareButton();
    displayProducts();
}

function updateCompareButton() {
    const compareBtn = document.getElementById('compare-btn');
    const compareCount = document.getElementById('compare-count');

    compareCount.textContent = compareList.length;

    if (compareList.length >= 2) {
        compareBtn.style.display = 'block';
    } else {
        compareBtn.style.display = 'none';
    }
}

function displayCompare() {
    const compareTable = document.getElementById('compare-table');

    if (compareList.length === 0) {
        compareTable.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Aucun produit à comparer</p>';
        return;
    }

    const compareProducts = products.filter(p => compareList.includes(p.id));

    let html = '<div class="compare-grid">';

    compareProducts.forEach(product => {
        html += `
            <div class="compare-item">
                <div class="compare-item-image">${product.icon}</div>
                <h3>${product.name}</h3>
                <div class="compare-spec-row">
                    <span>Prix:</span>
                    <strong>${product.price.toFixed(2)} €</strong>
                </div>
                <div class="compare-spec-row">
                    <span>Note:</span>
                    <strong>${product.rating} ⭐</strong>
                </div>
                <div class="compare-spec-row">
                    <span>Matériau:</span>
                    <strong>${product.material}</strong>
                </div>
                <div class="compare-spec-row">
                    <span>Poids:</span>
                    <strong>${product.weight}</strong>
                </div>
                <div class="compare-spec-row">
                    <span>Longueur:</span>
                    <strong>${product.length}</strong>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Ajouter au panier</button>
                <button class="remove-compare" onclick="removeFromCompare(${product.id})">Retirer</button>
            </div>
        `;
    });

    html += '</div>';
    compareTable.innerHTML = html;
}

function removeFromCompare(productId) {
    const index = compareList.indexOf(productId);
    if (index !== -1) {
        compareList.splice(index, 1);
        updateCompareButton();
        displayCompare();
        displayProducts();
    }
}

// ===== MODAL PRODUIT DÉTAILLÉ =====

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('product-modal');
    const mainImage = document.getElementById('main-product-image');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    const productDetailContent = document.getElementById('product-detail-content');

    // Image principale
    mainImage.innerHTML = `<span style="font-size: 8rem;">${product.images[0]}</span>`;

    // Miniatures
    thumbnailGallery.innerHTML = '';
    product.images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<span>${img}</span>`;
        thumb.onclick = () => {
            mainImage.innerHTML = `<span style="font-size: 8rem;">${img}</span>`;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        };
        thumbnailGallery.appendChild(thumb);
    });

    // Détails du produit
    productDetailContent.innerHTML = `
        <div class="product-rating">
            <span class="stars">${generateStars(product.rating)}</span>
            <span class="rating-count">(${product.reviewCount} avis)</span>
        </div>
        <h2>${product.name}</h2>
        <div class="product-detail-price">${product.price.toFixed(2)} €</div>
        <p class="product-detail-description">${product.description}</p>

        <div class="product-detail-specs">
            <h3>Caractéristiques</h3>
            <div class="spec-item">
                <span>Matériau:</span>
                <strong>${product.material}</strong>
            </div>
            <div class="spec-item">
                <span>Poids:</span>
                <strong>${product.weight}</strong>
            </div>
            <div class="spec-item">
                <span>Longueur:</span>
                <strong>${product.length}</strong>
            </div>
        </div>

        <button class="cta-button" onclick="addToCart(${product.id}); closeModal('product-modal')">
            Ajouter au panier
        </button>

        <div class="reviews-section">
            <h3>Avis clients</h3>
            ${reviews[product.id] ? reviews[product.id].map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <span class="reviewer-name">${review.name}</span>
                        <span class="stars">${generateStars(review.rating)}</span>
                    </div>
                    <p class="review-text">${review.text}</p>
                </div>
            `).join('') : '<p>Aucun avis pour le moment</p>'}
        </div>
    `;

    modal.style.display = 'block';
}

// ===== CHECKOUT =====

function openCheckout() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'error');
        return;
    }

    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');

    // Afficher les articles
    checkoutItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>${itemTotal.toFixed(2)} €</span>
        `;
        checkoutItems.appendChild(checkoutItem);
    });

    // Calculer le total avec réduction
    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            discount = subtotal * (appliedPromo.discount / 100);
        } else {
            discount = appliedPromo.discount;
        }
    }

    const total = subtotal - discount;
    checkoutTotal.textContent = total.toFixed(2);

    closeModal('cart-modal');
    checkoutModal.style.display = 'block';
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    // Simuler le traitement de la commande
    showNotification('Commande confirmée ! Vous allez recevoir un email de confirmation.', 'success');

    // Vider le panier
    cart = [];
    updateCartCount();
    saveToLocalStorage();

    // Fermer le modal
    closeModal('checkout-modal');

    // Afficher un message de remerciement
    setTimeout(() => {
        showNotification('Merci pour votre commande ! 🎉', 'success');
    }, 1000);
}

// ===== CHATBOT =====

const chatbotResponses = {
    "bonjour": "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    "hello": "Hello ! How can I help you?",
    "prix": "Nos fourchettes sont disponibles de 12.99€ à 129.99€. Quelle catégorie vous intéresse ?",
    "livraison": "Nous livrons sous 48h en France métropolitaine. Livraison offerte dès 50€ d'achat !",
    "paiement": "Nous acceptons CB, PayPal et virement bancaire.",
    "garantie": "Toutes nos fourchettes ont une garantie de 5 ans minimum.",
    "contact": "Vous pouvez nous contacter au +33 1 23 45 67 89 ou par email: contact@forkshop.fr",
    "matériaux": "Nous proposons des fourchettes en inox 18/10, argent massif 925 et bois nobles (olivier, noyer, hêtre).",
    "merci": "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.",
    "default": "Je suis là pour vous aider ! Posez-moi des questions sur nos produits, la livraison, les prix..."
};

function handleChatbotMessage() {
    const input = document.getElementById('chatbot-input-field');
    const message = input.value.trim().toLowerCase();

    if (message === '') return;

    const messagesContainer = document.getElementById('chatbot-messages');

    // Message utilisateur
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = input.value;
    messagesContainer.appendChild(userMessage);

    // Réponse du bot
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'bot-message';

        let response = chatbotResponses.default;
        for (let keyword in chatbotResponses) {
            if (message.includes(keyword)) {
                response = chatbotResponses[keyword];
                break;
            }
        }

        botMessage.textContent = response;
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);

    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ===== THÈME SOMBRE =====

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }

    saveToLocalStorage();
}

// ===== ANIMATIONS =====

// Scroll Reveal
function handleScrollReveal() {
    const reveals = document.querySelectorAll('[data-scroll-reveal]');

    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            element.classList.add('revealed');
        }
    });
}

// Parallax effet léger
function handleParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    const scrolled = window.pageYOffset;

    parallaxElements.forEach(element => {
        const speed = 0.05;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// ===== MODALS =====

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ===== FAQ =====

function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Fermer tous les autres items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle l'item actuel
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// ===== NEWSLETTER =====

function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification(`Merci ! Vous êtes maintenant inscrit à notre newsletter (${email})`, 'success');
    e.target.reset();
}

// ===== INITIALISATION =====

document.addEventListener('DOMContentLoaded', () => {
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }

    // Afficher les produits - DÉSACTIVÉ car api-script.js charge depuis l'API
    // displayProducts();

    // Mettre à jour les compteurs
    updateCartCount();
    updateWishlistCount();

    // === FILTRES ===
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            displayProducts();
        });
    });

    // === RECHERCHE ===
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        displayProducts();
    });

    // === TRI ===
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        displayProducts();
    });

    // === VUE GRILLE/LISTE ===
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentView = button.dataset.view;
            displayProducts();
        });
    });

    // === MODALS ===

    // Modal Panier
    document.getElementById('cart-icon').addEventListener('click', () => {
        document.getElementById('cart-modal').style.display = 'block';
        displayCart();
    });

    // Modal Wishlist
    document.getElementById('wishlist-icon').addEventListener('click', () => {
        document.getElementById('wishlist-modal').style.display = 'block';
        displayWishlist();
    });

    // Modal Comparateur
    document.getElementById('compare-btn').addEventListener('click', () => {
        document.getElementById('compare-modal').style.display = 'block';
        displayCompare();
    });

    // Fermeture des modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Clic en dehors du modal
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // === CODE PROMO ===
    document.getElementById('apply-promo').addEventListener('click', applyPromoCode);

    // === CHECKOUT ===
    document.getElementById('checkout-btn').addEventListener('click', openCheckout);
    document.getElementById('checkout-form').addEventListener('submit', handleCheckoutSubmit);

    // === CHATBOT ===
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbot = document.getElementById('chatbot');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotInput = document.getElementById('chatbot-input-field');

    chatbotToggle.addEventListener('click', () => {
        chatbot.classList.toggle('active');
    });

    chatbotClose.addEventListener('click', () => {
        chatbot.classList.remove('active');
    });

    chatbotSend.addEventListener('click', handleChatbotMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatbotMessage();
        }
    });

    // === THÈME ===
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // === NEWSLETTER ===
    document.getElementById('newsletter-form').addEventListener('submit', handleNewsletterSubmit);

    // === FAQ ===
    initFAQ();

    // === NAVIGATION SMOOTH ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // === NAVIGATION ACTIVE ===
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Scroll reveal
        handleScrollReveal();

        // Parallax
        handleParallax();

        // Navigation active
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Initial scroll reveal
    handleScrollReveal();
});

// Animations CSS supplémentaires
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
