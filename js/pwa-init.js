// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  console.log('Service Worker supported in this browser');
  
  window.addEventListener('load', () => {
    console.log('Window loaded, registering service worker...');
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check current state
        if (registration.installing) {
          console.log('Service Worker installing');
        } else if (registration.waiting) {
          console.log('Service Worker waiting');
        } else if (registration.active) {
          console.log('Service Worker active');
        }
        
        // Check for updates to service worker
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          console.log('Update found for Service Worker');
          
          installingWorker.onstatechange = () => {
            console.log('Service Worker state changed to:', installingWorker.state);
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New content is available; please refresh.');
                
                // Show update notification if desired
                showUpdateNotification();
              } else {
                // No previous service worker
                console.log('Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });

  // Log service worker controlling status
  if (navigator.serviceWorker.controller) {
    console.log('This page is currently controlled by a service worker');
  } else {
    console.log('This page is not currently controlled by a service worker');
  }

  // Handle sync for offline data
  window.addEventListener('online', () => {
    console.log('Device back online, registering sync task');
    navigator.serviceWorker.ready
      .then(registration => {
        registration.sync.register('sync-player-data');
        console.log('Sync task registered successfully');
      })
      .catch(err => {
        console.log('Sync registration failed:', err);
      });
  });
  
  // Add a function to manually check cache status
  window.checkCache = async function() {
    try {
      const cache = await caches.open('eskimos-r2g-v1');
      const keys = await cache.keys();
      console.log('Cached resources:', keys.map(req => req.url));
      return keys.length;
    } catch (err) {
      console.error('Error checking cache:', err);
      return 0;
    }
  };
}

// Show update notification
function showUpdateNotification() {
  // Check if notification container exists
  let container = document.getElementById('pwa-update-notification');
  
  // Create if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'pwa-update-notification';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.backgroundColor = '#333';
    container.style.color = '#fff';
    container.style.padding = '15px';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    container.style.zIndex = '1000';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';
    
    const message = document.createElement('div');
    message.textContent = 'New version available!';
    
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh';
    refreshButton.style.marginLeft = '15px';
    refreshButton.style.padding = '5px 10px';
    refreshButton.style.backgroundColor = '#4caf50';
    refreshButton.style.color = 'white';
    refreshButton.style.border = 'none';
    refreshButton.style.borderRadius = '3px';
    refreshButton.style.cursor = 'pointer';
    
    refreshButton.addEventListener('click', () => {
      window.location.reload();
    });
    
    container.appendChild(message);
    container.appendChild(refreshButton);
    document.body.appendChild(container);
  }
}

// Handle install prompt (Add to Home Screen)
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67+ from automatically showing the prompt
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button if it exists
  const installButton = document.getElementById('install-pwa-button');
  if (installButton) {
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', () => {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        // Clear the saved prompt
        deferredPrompt = null;
        
        // Hide the button
        installButton.style.display = 'none';
      });
    });
  }
}); 