/**
 * Service Worker Registration
 * This script checks if service workers are supported and registers one if possible
 */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js')
            .then(function(registration) {
                console.log('Service Worker registered with scope:', registration.scope);
                
                // Check if there's a new service worker waiting to activate
                if (registration.waiting) {
                    notifyUserOfUpdate(registration);
                }
                
                // Listen for new service workers
                registration.addEventListener('updatefound', function() {
                    const newWorker = registration.installing;
                    
                    // Track progress of the new service worker
                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is ready but waiting
                            notifyUserOfUpdate(registration);
                        }
                    });
                });
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
        
        // Listen for controller change to reload page
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', function() {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}

/**
 * Notify user about the service worker update and provide a button to update
 * @param {ServiceWorkerRegistration} registration - The service worker registration
 */
function notifyUserOfUpdate(registration) {
    // Check if we should show update notification
    // (Skip for first-time users or if page refresh was recent)
    if (!localStorage.getItem('swInstalled') || (Date.now() - (localStorage.getItem('lastRefresh') || 0) < 3600000)) {
        localStorage.setItem('swInstalled', 'true');
        localStorage.setItem('lastRefresh', Date.now());
        return;
    }
    
    // Create update notification
    const updateNotification = document.createElement('div');
    updateNotification.className = 'update-notification';
    updateNotification.innerHTML = `
        <div class="update-content">
            <p>A new version of this site is available!</p>
            <button id="update-button">Update Now</button>
            <button id="dismiss-update">Later</button>
        </div>
    `;
    
    document.body.appendChild(updateNotification);
    
    // Show notification with animation
    setTimeout(() => {
        updateNotification.classList.add('show');
    }, 1000);
    
    // Handle update button click
    document.getElementById('update-button').addEventListener('click', function() {
        if (registration.waiting) {
            // Send message to service worker to skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        updateNotification.classList.remove('show');
    });
    
    // Handle dismiss button click
    document.getElementById('dismiss-update').addEventListener('click', function() {
        updateNotification.classList.remove('show');
        setTimeout(() => {
            updateNotification.remove();
        }, 300);
    });
} 