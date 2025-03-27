/**
 * Background Mobile Scroll JS
 * Handles responsive background image on mobile devices
 * Makes background fill the screen and move with scrolling
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
                    background-size: cover !important;
                    background-position: center center !important;
                    background-repeat: no-repeat !important;
                    background-attachment: scroll !important; /* Changed from fixed to scroll */
                    min-height: ${viewportHeight}px;
                }
                
                /* For pages that might have a different image path */
                body[data-alt-bg="true"] {
                    background-image: url('../assets/images/logo.webp');
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
    
    // Add slight parallax effect on scroll for mobile
    if (window.innerWidth <= 768) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            const moveRate = scrollPosition * 0.05; // Adjust the rate of movement
            
            document.body.style.backgroundPositionY = `calc(center + ${moveRate}px)`;
        });
    }
}); 