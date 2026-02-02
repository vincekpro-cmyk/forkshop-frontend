// ===== SYSTÈME DE GESTION D'ÉTAT ET UX AMÉLIORÉ =====

const AppState = (function() {
    'use strict';

    // État de l'application
    let state = {
        isLoading: false,
        isOnline: navigator.onLine,
        apiHealthy: true,
        lastSync: null,
        errors: [],
        pendingActions: []
    };

    // Observateurs
    const observers = [];

    // ===== GESTION D'ÉTAT =====

    function setState(updates) {
        state = { ...state, ...updates };
        notifyObservers();
    }

    function getState() {
        return { ...state };
    }

    function subscribe(callback) {
        observers.push(callback);
        return () => {
            const index = observers.indexOf(callback);
            if (index > -1) observers.splice(index, 1);
        };
    }

    function notifyObservers() {
        observers.forEach(callback => callback(state));
    }

    // ===== LOADING STATES =====

    function showGlobalLoader(message = 'Chargement...') {
        setState({ isLoading: true });

        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = `
                <div class="loader-backdrop">
                    <div class="loader-content">
                        <div class="spinner"></div>
                        <p class="loader-message">${message}</p>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            loader.querySelector('.loader-message').textContent = message;
            loader.style.display = 'flex';
        }
    }

    function hideGlobalLoader() {
        setState({ isLoading: false });

        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    function showSkeleton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const skeletonHTML = `
            <div class="skeleton-grid">
                ${Array(6).fill(0).map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text short"></div>
                        <div class="skeleton-button"></div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = skeletonHTML;
    }

    // ===== NOTIFICATIONS TOAST =====

    const toastQueue = [];
    let isShowingToast = false;

    function showToast(message, type = 'info', duration = 3000) {
        toastQueue.push({ message, type, duration });
        if (!isShowingToast) {
            processToastQueue();
        }
    }

    function processToastQueue() {
        if (toastQueue.length === 0) {
            isShowingToast = false;
            return;
        }

        isShowingToast = true;
        const { message, type, duration } = toastQueue.shift();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        container.appendChild(toast);

        // Animation d'entrée
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                processToastQueue();
            }, 300);
        }, duration);
    }

    // ===== GESTION D'ERREURS AVANCÉE =====

    async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;

                const backoffDelay = delay * Math.pow(2, i);
                showToast(`Tentative ${i + 1}/${maxRetries}... Nouvelle tentative dans ${backoffDelay/1000}s`, 'warning', 2000);

                await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
        }
    }

    function handleError(error, context = '') {
        console.error(`Erreur [${context}]:`, error);

        setState({
            errors: [...state.errors, { error, context, timestamp: Date.now() }]
        });

        // Messages d'erreur user-friendly
        let userMessage = 'Une erreur est survenue';

        if (!navigator.onLine) {
            userMessage = 'Pas de connexion Internet';
        } else if (error.message?.includes('fetch')) {
            userMessage = 'Impossible de contacter le serveur';
        } else if (error.message) {
            userMessage = error.message;
        }

        showToast(userMessage, 'error', 5000);
    }

    // ===== MONITORING CONNEXION =====

    function initNetworkMonitoring() {
        window.addEventListener('online', () => {
            setState({ isOnline: true });
            showToast('Connexion rétablie ! 🎉', 'success');
            syncPendingActions();
        });

        window.addEventListener('offline', () => {
            setState({ isOnline: false });
            showToast('Mode hors ligne activé 📴', 'warning', 5000);
        });

        // Check API health périodiquement
        setInterval(checkAPIHealth, 60000); // Chaque minute
    }

    async function checkAPIHealth() {
        if (!window.ForkShopAPI) return;

        try {
            await fetch('https://forkshop-api.onrender.com/', {
                method: 'HEAD',
                timeout: 5000
            });
            if (!state.apiHealthy) {
                setState({ apiHealthy: true });
                showToast('API reconnectée ✓', 'success');
            }
        } catch (error) {
            if (state.apiHealthy) {
                setState({ apiHealthy: false });
                showToast('API temporairement indisponible', 'warning');
            }
        }
    }

    // ===== ACTIONS DIFFÉRÉES (Offline Support) =====

    function queueAction(action, data) {
        const pendingActions = [...state.pendingActions, { action, data, timestamp: Date.now() }];
        setState({ pendingActions });
        localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
    }

    async function syncPendingActions() {
        if (!state.isOnline || state.pendingActions.length === 0) return;

        showGlobalLoader('Synchronisation...');

        for (const { action, data } of state.pendingActions) {
            try {
                await action(data);
            } catch (error) {
                console.error('Erreur sync action:', error);
            }
        }

        setState({ pendingActions: [] });
        localStorage.removeItem('pendingActions');
        hideGlobalLoader();
        showToast('Synchronisation terminée ✓', 'success');
    }

    // ===== CONFIRMATION MODALS =====

    function showConfirm(message, onConfirm, onCancel) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal-content confirm-content">
                        <p class="confirm-message">${message}</p>
                        <div class="confirm-actions">
                            <button class="btn-cancel">Annuler</button>
                            <button class="btn-confirm">Confirmer</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.btn-confirm').onclick = () => {
                modal.remove();
                if (onConfirm) onConfirm();
                resolve(true);
            };

            modal.querySelector('.btn-cancel').onclick = () => {
                modal.remove();
                if (onCancel) onCancel();
                resolve(false);
            };

            modal.querySelector('.modal-backdrop').onclick = (e) => {
                if (e.target === e.currentTarget) {
                    modal.remove();
                    if (onCancel) onCancel();
                    resolve(false);
                }
            };
        });
    }

    // ===== INITIALISATION =====

    function init() {
        initNetworkMonitoring();
        checkAPIHealth();

        // Restaurer les actions en attente
        try {
            const saved = localStorage.getItem('pendingActions');
            if (saved) {
                setState({ pendingActions: JSON.parse(saved) });
            }
        } catch (error) {
            console.error('Erreur restauration actions:', error);
        }

        // Ajouter les styles
        addStyles();
    }

    function addStyles() {
        if (document.getElementById('app-state-styles')) return;

        const style = document.createElement('style');
        style.id = 'app-state-styles';
        style.textContent = `
            /* Global Loader */
            #global-loader {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .loader-backdrop {
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .loader-content {
                background: white;
                padding: 2rem;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }

            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary-color, #667eea);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loader-message {
                margin: 0;
                color: #333;
                font-weight: 500;
            }

            /* Skeleton Screens */
            .skeleton-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 2rem;
                padding: 2rem;
            }

            .skeleton-card {
                background: white;
                border-radius: 10px;
                padding: 1rem;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .skeleton-image {
                width: 100%;
                height: 200px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .skeleton-text {
                height: 20px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 0.5rem;
            }

            .skeleton-text.short {
                width: 60%;
            }

            .skeleton-button {
                height: 40px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 8px;
                margin-top: 1rem;
            }

            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            /* Toast Notifications */
            #toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .toast {
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 300px;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast-success {
                border-left: 4px solid #4caf50;
            }

            .toast-error {
                border-left: 4px solid #f44336;
            }

            .toast-warning {
                border-left: 4px solid #ff9800;
            }

            .toast-info {
                border-left: 4px solid #2196f3;
            }

            .toast-icon {
                font-size: 1.5rem;
                font-weight: bold;
            }

            .toast-success .toast-icon { color: #4caf50; }
            .toast-error .toast-icon { color: #f44336; }
            .toast-warning .toast-icon { color: #ff9800; }
            .toast-info .toast-icon { color: #2196f3; }

            .toast-message {
                flex: 1;
                font-size: 0.95rem;
            }

            .toast-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .toast-close:hover {
                color: #333;
            }

            /* Confirm Modal */
            .confirm-modal .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(3px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
            }

            .confirm-content {
                background: white;
                padding: 2rem;
                border-radius: 15px;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }

            .confirm-message {
                margin: 0 0 1.5rem;
                font-size: 1.1rem;
                text-align: center;
            }

            .confirm-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .confirm-actions button {
                padding: 0.8rem 2rem;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-cancel {
                background: #f0f0f0;
                color: #333;
            }

            .btn-cancel:hover {
                background: #e0e0e0;
            }

            .btn-confirm {
                background: var(--primary-color, #667eea);
                color: white;
            }

            .btn-confirm:hover {
                background: var(--primary-dark, #5568d3);
            }
        `;
        document.head.appendChild(style);
    }

    // API Publique
    return {
        init,
        getState,
        setState,
        subscribe,
        showGlobalLoader,
        hideGlobalLoader,
        showSkeleton,
        showToast,
        handleError,
        retryWithBackoff,
        queueAction,
        syncPendingActions,
        showConfirm
    };
})();

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppState.init());
} else {
    AppState.init();
}

// Rendre disponible globalement
window.AppState = AppState;
