/**
 * Mobile Background Scroll Fix
 * Makes the background image scroll with the content on mobile screens
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a mobile device
    const isMobile = window.innerWidth <= 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Create a style element for mobile background scrolling
        const mobileScrollStyle = document.createElement('style');
        mobileScrollStyle.setAttribute('data-mobile-scroll', 'true');
        
        // Set up styles to make background scroll with content on mobile
        mobileScrollStyle.textContent = `
            /* Override fixed background on mobile */
            body::before {
                position: absolute !important;
                background-attachment: scroll !important;
                height: 100% !important;
                min-height: 100vh !important;
                top: 0 !important;
                left: 0 !important;
                background-position: center top !important;
                z-index: -10 !important;
            }
            
            /* Ensure body has proper setup for scrolling background */
            body {
                position: relative !important;
                background-attachment: scroll !important;
            }
            
            /* Make overlay properly scroll over the background */
            .overlay {
                position: relative !important;
                z-index: 2 !important;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(20, 20, 40, 0.8), rgba(0, 0, 0, 0.85)) !important;
            }
        `;
        
        // Add the style to the document head
        document.head.appendChild(mobileScrollStyle);
        
        // Force background to be in document flow (not fixed)
        document.body.style.backgroundAttachment = 'scroll';
        
        // Alternative approach: create an actual background element instead of using ::before
        const createScrollableBackground = () => {
            // Check if background element already exists
            if (!document.getElementById('mobile-scrollable-bg')) {
                // Get current path to logo.webp
                const currentPath = window.location.pathname;
                const isInSubdirectory = currentPath.split('/').length > 2;
                const backgroundPath = isInSubdirectory ? '../assets/images/logo.webp' : 'assets/images/logo.webp';
                
                // Create background element
                const bgElement = document.createElement('div');
                bgElement.id = 'mobile-scrollable-bg';
                
                // Style the background element
                bgElement.style.position = 'absolute';
                bgElement.style.top = '0';
                bgElement.style.left = '0';
                bgElement.style.width = '100%';
                bgElement.style.height = '100%';
                bgElement.style.backgroundImage = `url('${backgroundPath}')`;
                bgElement.style.backgroundSize = 'contain';
                bgElement.style.backgroundPosition = 'center top';
                bgElement.style.backgroundRepeat = 'no-repeat';
                bgElement.style.backgroundAttachment = 'scroll';
                bgElement.style.backgroundColor = '#000';
                bgElement.style.zIndex = '-5';
                
                // Insert before the first child of body
                document.body.insertBefore(bgElement, document.body.firstChild);
            }
        };
        
        // Apply the alternative approach
        createScrollableBackground();
        
        // Handle resize events
        window.addEventListener('resize', function() {
            // Re-apply mobile fixes if screen size changes to mobile
            if (window.innerWidth <= 768) {
                createScrollableBackground();
            }
        });
    }
}); 