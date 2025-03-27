/**
 * Mobile Background Scroll Fix
 * Makes the background image scroll with the content on mobile screens
 * This script should run AFTER background-fix.js to ensure it overrides the fixed styles
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a mobile device
    const isMobile = window.innerWidth <= 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log("Mobile device detected, applying background scroll fix");
        
        // Function to apply mobile scroll fix
        const applyMobileScrollFix = () => {
            // Remove any existing mobile scroll style to avoid duplication
            const existingStyle = document.querySelector('style[data-mobile-scroll="true"]');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            // Create a style element for mobile background scrolling with higher specificity
            const mobileScrollStyle = document.createElement('style');
            mobileScrollStyle.setAttribute('data-mobile-scroll', 'true');
            
            // Set up styles to make background scroll with content on mobile
            // Using !important to override any other styles
            mobileScrollStyle.textContent = `
                /* Override fixed background on mobile */
                body::before {
                    position: absolute !important;
                    background-attachment: scroll !important;
                    height: 100% !important;
                    min-height: 100vh !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    background-position: center top !important;
                    z-index: -10 !important;
                    background-size: contain !important;
                    background-repeat: no-repeat !important;
                    background-color: #000 !important;
                }
                
                /* Ensure body has proper setup for scrolling background */
                body {
                    position: relative !important;
                    background-attachment: scroll !important;
                    overflow-x: hidden !important;
                }
                
                /* Make overlay properly scroll over the background */
                .overlay {
                    position: relative !important;
                    z-index: 2 !important;
                }
            `;
            
            // Add the style to the document head
            document.head.appendChild(mobileScrollStyle);
            
            // Force background to be in document flow (not fixed)
            document.body.style.backgroundAttachment = 'scroll';
            
            // Create a dedicated scrollable background element for mobile
            createScrollableBackground();
        };
        
        // Alternative approach: create an actual background element instead of using ::before
        const createScrollableBackground = () => {
            // Remove existing background element if it exists
            const existingBg = document.getElementById('mobile-scrollable-bg');
            if (existingBg) {
                existingBg.remove();
            }
            
            // Get current path to logo.webp
            const currentPath = window.location.pathname;
            const isInSubdirectory = currentPath.split('/').length > 2;
            const backgroundPath = isInSubdirectory ? '../assets/images/logo.webp' : 'assets/images/logo.webp';
            
            // Create background element
            const bgElement = document.createElement('div');
            bgElement.id = 'mobile-scrollable-bg';
            
            // Style the background element
            bgElement.style.position = 'fixed';
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
            bgElement.style.zIndex = '-9'; // Higher than body::before but lower than content
            
            // Insert at the beginning of body
            document.body.insertBefore(bgElement, document.body.firstChild);
            
            // Add an onscroll event to move the background
            window.addEventListener('scroll', function() {
                // Move the background with scroll
                bgElement.style.transform = `translateY(${window.scrollY * 0.5}px)`;
            });
        };
        
        // Wait a bit for background-fix.js to finish, then apply our fix
        // This ensures our mobile fix takes precedence
        setTimeout(() => {
            applyMobileScrollFix();
        }, 200);
        
        // Handle resize events
        window.addEventListener('resize', function() {
            // Re-apply mobile fixes if screen size changes to mobile
            if (window.innerWidth <= 768) {
                applyMobileScrollFix();
            }
        });
        
        // Re-apply on orientation change (important for mobile)
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                applyMobileScrollFix();
            }, 200);
        });
    }
}); 