/**
 * Background Mobile Scroll JS
 * Handles responsive background image on mobile devices
 * Makes background centered, fit to sides, and fill top/bottom with logo-matching colors
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get current page to set unique background flag
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const backgroundKey = 'background_' + currentPage;
    
    // Check if background styles have already been applied for this page
    const styleUpdated = sessionStorage.getItem(backgroundKey);
    
    function updateBackgroundStyles() {
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        
        // Create or update the style element
        let styleEl = document.getElementById('dynamic-background-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'dynamic-background-styles';
            document.head.appendChild(styleEl);
        }
        
        // Set responsive background styles based on device width
        if (viewportWidth <= 768) { // Mobile devices
            styleEl.innerHTML = `
                body {
                    background-image: url('assets/images/logo.webp') !important;
                    background-size: contain !important; /* Ensure image fits within viewport width */
                    background-position: center top !important; /* Center the image at the top */
                    background-repeat: no-repeat !important;
                    background-attachment: scroll !important; /* Changed from fixed to scroll */
                    background-color: #000 !important; /* Black background color */
                    min-height: 100vh;
                    position: relative;
                }
                
                /* Add pseudo-elements for top and bottom gradients */
                body::before,
                body::after {
                    content: '';
                    position: fixed;
                    left: 0;
                    right: 0;
                    height: 20%;
                    pointer-events: none;
                    z-index: -1;
                }
                
                /* Top gradient matching logo colors */
                body::before {
                    top: 0;
                    background: linear-gradient(to bottom, 
                        rgba(0, 0, 0, 1) 0%, 
                        rgba(0, 51, 102, 0.8) 50%, 
                        rgba(0, 0, 0, 0) 100%);
                }
                
                /* Bottom gradient matching logo colors */
                body::after {
                    bottom: 0;
                    background: linear-gradient(to top, 
                        rgba(0, 0, 0, 1) 0%, 
                        rgba(0, 51, 102, 0.8) 50%, 
                        rgba(0, 0, 0, 0) 100%);
                }
            `;
        } else { // Desktop and larger devices
            styleEl.innerHTML = `
                body {
                    background-image: url('assets/images/logo.webp') !important;
                    background-size: contain !important;
                    background-position: center top !important;
                    background-repeat: no-repeat !important;
                    background-attachment: fixed !important;
                    background-color: #000 !important;
                    min-height: 100vh;
                }
            `;
        }
        
        // Set flag to prevent multiple updates in the same session for this page
        sessionStorage.setItem(backgroundKey, 'true');
    }
    
    // Only run the update if it hasn't been applied for this page
    if (!styleUpdated) {
        // Initialize on load
        updateBackgroundStyles();
        
        // Update on resize or orientation change
        window.addEventListener('resize', updateBackgroundStyles);
        window.addEventListener('orientationchange', updateBackgroundStyles);
    }
    
    // Clear background flags on page refresh (not on normal navigation)
    window.addEventListener('beforeunload', function(e) {
        // The presence of returnValue indicates a page refresh rather than navigation
        if (e.returnValue !== undefined) {
            // Clear all background flags on page refresh
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('background_')) {
                    sessionStorage.removeItem(key);
                }
            });
        }
    });
}); 