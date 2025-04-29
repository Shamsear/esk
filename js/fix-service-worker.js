// Service Worker Reset Utility

// Function to unregister all service workers
async function unregisterAllServiceWorkers() {
  try {
    console.log('Attempting to unregister all service workers...');
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      console.log('No service workers found to unregister');
      return false;
    }
    
    for (let registration of registrations) {
      const result = await registration.unregister();
      console.log(`Service worker unregistered: ${result}`);
    }
    
    console.log('All service workers unregistered successfully');
    return true;
  } catch (error) {
    console.error('Error unregistering service workers:', error);
    return false;
  }
}

// Function to clear all caches
async function clearAllCaches() {
  try {
    console.log('Attempting to clear all caches...');
    const cacheNames = await caches.keys();
    
    if (cacheNames.length === 0) {
      console.log('No caches found to clear');
      return false;
    }
    
    for (let cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log(`Cache "${cacheName}" cleared`);
    }
    
    console.log('All caches cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing caches:', error);
    return false;
  }
}

// Function to perform a complete reset
async function resetServiceWorker() {
  try {
    const resultEl = document.getElementById('reset-result');
    if (resultEl) resultEl.textContent = 'Resetting service worker...';
    
    // Unregister all service workers
    const unregistered = await unregisterAllServiceWorkers();
    
    // Clear all caches
    const cleared = await clearAllCaches();
    
    if (resultEl) {
      if (unregistered || cleared) {
        resultEl.textContent = 'Service worker reset complete. Reloading page in 3 seconds...';
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        resultEl.textContent = 'Nothing to reset. Try reloading the page.';
      }
    } else {
      if (unregistered || cleared) {
        alert('Service worker reset complete. Please reload the page.');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting service worker:', error);
    if (document.getElementById('reset-result')) {
      document.getElementById('reset-result').textContent = `Error: ${error.message}`;
    }
    return false;
  }
}

// Export functions
window.SwReset = {
  unregisterAll: unregisterAllServiceWorkers,
  clearAllCaches: clearAllCaches,
  reset: resetServiceWorker
};

// Add UI if being viewed directly
if (document.currentScript && document.currentScript.hasAttribute('data-show-ui')) {
  document.addEventListener('DOMContentLoaded', () => {
    // Create UI elements if they don't exist
    if (!document.getElementById('sw-reset-container')) {
      const container = document.createElement('div');
      container.id = 'sw-reset-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.backgroundColor = '#333';
      container.style.color = '#fff';
      container.style.padding = '15px';
      container.style.borderRadius = '5px';
      container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      container.style.zIndex = '1000';
      
      const title = document.createElement('h3');
      title.textContent = 'Service Worker Tools';
      title.style.margin = '0 0 10px 0';
      
      const resetButton = document.createElement('button');
      resetButton.textContent = 'Reset Service Worker';
      resetButton.style.padding = '8px 15px';
      resetButton.style.backgroundColor = '#e74c3c';
      resetButton.style.color = 'white';
      resetButton.style.border = 'none';
      resetButton.style.borderRadius = '3px';
      resetButton.style.cursor = 'pointer';
      resetButton.style.marginRight = '10px';
      
      const result = document.createElement('div');
      result.id = 'reset-result';
      result.style.marginTop = '10px';
      result.style.fontSize = '14px';
      
      resetButton.addEventListener('click', resetServiceWorker);
      
      container.appendChild(title);
      container.appendChild(resetButton);
      container.appendChild(result);
      
      document.body.appendChild(container);
    }
  });
} 