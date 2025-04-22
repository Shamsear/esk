/**
 * PWA Install Prompt
 * Shows a clearly visible install button for PWA installation
 */

// Variables to manage install prompt
let deferredPrompt;

// Create floating install button
function createInstallButton() {
  // If install section already exists, return
  if (document.getElementById('pwa-install-section')) {
    return;
  }

  // Create a visible install section
  const installSection = document.createElement('div');
  installSection.id = 'pwa-install-section';
  installSection.className = 'pwa-install-section';
  
  // Section content with clear call to action
  installSection.innerHTML = `
    <div class="install-card">
      <div class="install-header">
        <img src="assets/images/logo11.webp" alt="R2G Logo" class="install-logo">
        <div class="install-title">
          <h3>Install Eskimos R2G</h3>
          <p>Get the full app experience!</p>
        </div>
      </div>
      <div class="install-benefits">
        <div class="benefit-item">
          <i class="fas fa-bolt"></i>
          <span>Faster access</span>
        </div>
        <div class="benefit-item">
          <i class="fas fa-wifi-slash"></i>
          <span>Works offline</span>
        </div>
        <div class="benefit-item">
          <i class="fas fa-mobile-alt"></i>
          <span>App-like experience</span>
        </div>
      </div>
      <button id="install-pwa-now" class="install-button">
        <i class="fas fa-download"></i> Install Now
      </button>
    </div>
  `;
  
  // Add to the page at a prominent location
  // Try to insert after header or at top of main content
  const targetLocation = document.querySelector('header') || 
                         document.querySelector('main') || 
                         document.querySelector('.overlay') ||
                         document.body.firstElementChild;
  
  if (targetLocation) {
    targetLocation.parentNode.insertBefore(installSection, targetLocation.nextSibling);
  } else {
    // Fallback: add to beginning of body
    document.body.insertBefore(installSection, document.body.firstChild);
  }
  
  // Add click event for install
  document.getElementById('install-pwa-now').addEventListener('click', promptInstall);
}

// Show install prompt
function promptInstall() {
  if (deferredPrompt) {
    // Show the browser install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        hideInstallOption();
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Reset the deferred prompt
      deferredPrompt = null;
    });
  } else {
    // If deferredPrompt is not available (e.g., already installed or not supported)
    showInstallInstructions();
  }
}

// Hide install option after installation
function hideInstallOption() {
  const installSection = document.getElementById('pwa-install-section');
  if (installSection) {
    installSection.style.display = 'none';
  }
  
  // Also hide any other install buttons
  const otherButtons = document.querySelectorAll('#install-pwa-button');
  otherButtons.forEach(button => {
    button.style.display = 'none';
  });
}

// Show manual install instructions if needed
function showInstallInstructions() {
  // Create instructions modal
  const instructionsModal = document.createElement('div');
  instructionsModal.id = 'install-instructions-modal';
  instructionsModal.className = 'install-instructions-modal';
  
  instructionsModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Install Eskimos R2G</h3>
        <button id="close-instructions" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <p>To install this app on your device:</p>
        
        <div class="install-steps chrome">
          <h4>Chrome (Android)</h4>
          <ol>
            <li>Tap the menu button (three dots) in the upper right</li>
            <li>Select "Install app" or "Add to Home Screen"</li>
          </ol>
        </div>
        
        <div class="install-steps safari">
          <h4>Safari (iOS)</h4>
          <ol>
            <li>Tap the share button (box with arrow) at the bottom</li>
            <li>Scroll and select "Add to Home Screen"</li>
          </ol>
        </div>
        
        <div class="install-steps desktop">
          <h4>Desktop Chrome/Edge</h4>
          <ol>
            <li>Click the install icon in the address bar</li>
            <li>Or click the menu and select "Install Eskimos R2G"</li>
          </ol>
        </div>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(instructionsModal);
  
  // Show modal
  setTimeout(() => {
    instructionsModal.classList.add('show');
  }, 100);
  
  // Add event listener to close button
  document.getElementById('close-instructions').addEventListener('click', () => {
    instructionsModal.classList.remove('show');
    setTimeout(() => {
      instructionsModal.remove();
    }, 300);
  });
}

// Check if PWA is already installed
function isPWAInstalled() {
  // Check if in standalone mode or if display-mode is standalone
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Check if the browser supports PWA installation
function isBrowserSupported() {
  return 'serviceWorker' in navigator;
}

// Initialize
function init() {
  // If already installed as PWA, don't show install option
  if (isPWAInstalled()) {
    return;
  }
  
  // Show install button if the browser supports service workers
  if (isBrowserSupported()) {
    // Show a permanent install option
    createInstallButton();
    
    // Also enable any existing install buttons
    const existingButtons = document.querySelectorAll('#install-pwa-button');
    existingButtons.forEach(button => {
      button.style.display = 'block';
      button.addEventListener('click', promptInstall);
    });
  }
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = e;
});

// Listen for appinstalled event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  hideInstallOption();
  deferredPrompt = null;
});

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 