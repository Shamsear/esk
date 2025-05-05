/**
 * Offline Manager - Handles offline detection and functionality
 */

// Function to check online status
function updateOnlineStatus() {
  const offlineIndicator = document.getElementById('offline-indicator');
  
  if (!navigator.onLine) {
    // Create offline indicator if it doesn't exist
    if (!offlineIndicator) {
      const indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.className = 'offline-indicator';
      indicator.textContent = 'You are offline. Some features may be limited.';
      document.body.prepend(indicator);
    }
    
    // Mark body for offline styling
    document.body.classList.add('offline');
    
    // Disable certain interactive elements
    document.querySelectorAll('.requires-online').forEach(el => {
      el.disabled = true;
      el.classList.add('disabled-offline');
    });
    
  } else {
    // Remove offline indicator
    if (offlineIndicator) {
      offlineIndicator.remove();
    }
    
    // Remove offline styling
    document.body.classList.remove('offline');
    
    // Re-enable interactive elements
    document.querySelectorAll('.disabled-offline').forEach(el => {
      el.disabled = false;
      el.classList.remove('disabled-offline');
    });
    
    // Try to sync any pending data
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-player-data');
      });
    }
  }
}

// Save form data to local storage for offline recovery
function saveFormToLocalStorage(formId, data = null) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  // If data is provided, use it directly
  if (data) {
    localStorage.setItem(`form_${formId}`, JSON.stringify(data));
    return;
  }
  
  // Otherwise collect form data
  const formData = {};
  const elements = form.elements;
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    // Skip buttons and submit elements
    if (element.type === 'button' || element.type === 'submit') continue;
    
    // Handle different input types
    if (element.type === 'checkbox' || element.type === 'radio') {
      formData[element.name] = element.checked;
    } else if (element.name) {
      formData[element.name] = element.value;
    } else if (element.id) {
      formData[element.id] = element.value;
    }
  }
  
  localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
}

// Restore form data from local storage
function restoreFormFromLocalStorage(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const savedData = localStorage.getItem(`form_${formId}`);
  if (!savedData) return;
  
  const formData = JSON.parse(savedData);
  const elements = form.elements;
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const value = element.name ? formData[element.name] : formData[element.id];
    
    if (value !== undefined) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.checked = value;
      } else {
        element.value = value;
      }
    }
  }
}

// Queue operations for later sync when online
function queueForSync(operation) {
  let syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  syncQueue.push({
    ...operation,
    timestamp: new Date().getTime()
  });
  localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
}

// Initial setup
document.addEventListener('DOMContentLoaded', function() {
  // Set up listeners for online/offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Check initial status
  updateOnlineStatus();
  
  // Track standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    document.body.classList.add('pwa-mode');
  }
}); 