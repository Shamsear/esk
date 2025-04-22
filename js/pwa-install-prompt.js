/**
 * PWA Install Prompt
 * Shows a custom install prompt for PWA installation when visiting the site
 */

// Variables to manage install prompt
let deferredPrompt;
let hasPromptedUser = false;

// Check if the user has already been prompted
function hasUserBeenPrompted() {
  return localStorage.getItem('pwaPromptShown') === 'true';
}

// Set that the user has been prompted
function setUserPrompted() {
  localStorage.setItem('pwaPromptShown', 'true');
}

// Create floating install banner
function createInstallBanner() {
  // If banner already exists, return
  if (document.getElementById('pwa-install-banner')) {
    return;
  }

  // Create banner container
  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.className = 'pwa-install-banner';
  
  // Banner content
  banner.innerHTML = `
    <div class="banner-content">
      <img src="assets/images/logo11.webp" alt="R2G Logo" class="banner-logo">
      <div class="banner-text">
        <h3>Install Eskimos R2G</h3>
        <p>Get quick access to Road to Glory on your device!</p>
      </div>
    </div>
    <div class="banner-actions">
      <button id="pwa-install-btn" class="banner-install-btn">Install</button>
      <button id="pwa-dismiss-btn" class="banner-dismiss-btn">Not now</button>
    </div>
    <button id="pwa-close-btn" class="banner-close-btn" aria-label="Close">&times;</button>
  `;
  
  // Add banner to page
  document.body.appendChild(banner);
  
  // Show banner with animation
  setTimeout(() => {
    banner.classList.add('show');
  }, 100);
  
  // Add event listeners
  document.getElementById('pwa-install-btn').addEventListener('click', promptInstall);
  document.getElementById('pwa-dismiss-btn').addEventListener('click', dismissBanner);
  document.getElementById('pwa-close-btn').addEventListener('click', closeBanner);
}

// Show install prompt
function promptInstall() {
  const banner = document.getElementById('pwa-install-banner');
  
  if (deferredPrompt) {
    // Show the browser install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Reset the deferred prompt
      deferredPrompt = null;
      
      // Mark that we've prompted the user
      setUserPrompted();
      
      // Remove the banner
      if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
          banner.remove();
        }, 300);
      }
    });
  }
}

// Dismiss banner temporarily (will show again next visit)
function dismissBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(() => {
      banner.remove();
    }, 300);
  }
  
  // We'll set a session flag to not show again in this session
  sessionStorage.setItem('pwaPromptDismissed', 'true');
}

// Close banner permanently
function closeBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(() => {
      banner.remove();
    }, 300);
  }
  
  // Mark that we've prompted the user permanently
  setUserPrompted();
}

// Check if PWA is already installed
function isPWAInstalled() {
  // Check if in standalone mode or if display-mode is standalone
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    return true;
  }
  return false;
}

// Check if the browser supports PWA installation
function isInstallable() {
  // Return true if:
  // 1. We have a deferredPrompt (means beforeinstallprompt was fired)
  // 2. The browser supports service workers
  // 3. The browser supports PWA features
  return deferredPrompt && 'serviceWorker' in navigator && window.matchMedia('(display-mode: browser)').matches;
}

// Initialize the PWA prompt
function initPWAPrompt() {
  // Don't show if:
  // 1. Already installed as PWA
  // 2. Already prompted user
  // 3. User dismissed in this session
  // 4. Not installable
  if (
    isPWAInstalled() || 
    hasUserBeenPrompted() || 
    sessionStorage.getItem('pwaPromptDismissed') === 'true' || 
    !isInstallable()
  ) {
    return;
  }
  
  // Show our custom banner after a short delay
  setTimeout(() => {
    createInstallBanner();
  }, 3000);
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Initialize our custom prompt
  initPWAPrompt();
});

// Listen for appinstalled event
window.addEventListener('appinstalled', () => {
  // Log that the app was installed
  console.log('PWA was installed');
  
  // Clear the deferredPrompt
  deferredPrompt = null;
  
  // Mark as prompted
  setUserPrompted();
  
  // Remove the banner if it exists
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.remove();
  }
});

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // If we have a deferred prompt, initialize
  if (deferredPrompt) {
    initPWAPrompt();
  }
}); 