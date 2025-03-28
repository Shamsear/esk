/**
 * Background Mobile Scroll JS
 * Handles responsive background image on mobile devices
 * Makes background centered, fit to sides, and fill top/bottom with logo-matching colors
 */

document.addEventListener('DOMContentLoaded', function() {
    function updateBackgroundStyles() {
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
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
                    background-image: url('assets/images/logo.webp');
                    background-size: contain !important; /* Ensure image fits within viewport width */
                    background-position: center top !important; /* Center the image at the top */
                    background-repeat: no-repeat !important;
                    background-attachment: scroll !important; /* Changed from fixed to scroll */
                    background-color: #000 !important; /* Black background color */
                    min-height: 100vh;
                    position: relative;
                }
                
                /* For pages that might have a different image path */
                body[data-alt-bg="true"] {
                    background-image: url('../assets/images/logo.webp');
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
                    background-image: url('assets/images/logo.webp');
                    background-size: contain;
                    background-position: center top;
                    background-repeat: no-repeat;
                    background-attachment: fixed;
                    background-color: #000;
                    min-height: 100vh;
                }
                
                /* For pages that might have a different image path */
                body[data-alt-bg="true"] {
                    background-image: url('../assets/images/logo.webp');
                }
            `;
        }
    }
    
    // Check for relative path issues and set appropriate attribute
    if (document.body.style.backgroundImage && document.body.style.backgroundImage.includes('../')) {
        document.body.setAttribute('data-alt-bg', 'true');
    }
    
    // Initialize on load
    updateBackgroundStyles();
    
    // Update on resize or orientation change
    window.addEventListener('resize', updateBackgroundStyles);
    window.addEventListener('orientationchange', updateBackgroundStyles);
    
    // Remove the problematic parallax effect on scroll for mobile
    // This was causing the conflict between pages
}); 