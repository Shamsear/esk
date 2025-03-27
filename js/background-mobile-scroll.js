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
                    display: none !important; /* Hide the default background element */
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
            
            // Create a dedicated scrollable background element for mobile
            createScrollableBackground();
        };
        
        // Create an actual background element instead of using ::before
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
            bgElement.style.zIndex = '-9'; // Higher than body::before but lower than content
            
            // Insert at the beginning of body
            document.body.insertBefore(bgElement, document.body.firstChild);
            
            // Set initial height to be at least the height of the document
            updateBackgroundHeight();
            
            // Add an onscroll event to move the background with scroll
            window.addEventListener('scroll', function() {
                // Calculate scroll percentage - this is what synchronizes the image with content
                let scrollPercentage = window.scrollY / (document.body.scrollHeight - window.innerHeight);
                
                // Calculate background position to match scroll position of content
                // This makes the background stay with the content instead of falling behind
                bgElement.style.transform = `translateY(${window.scrollY}px)`;
                
                // Update background height as needed while scrolling
                updateBackgroundHeight();
            });
            
            // Function to ensure background is always tall enough
            function updateBackgroundHeight() {
                // Make sure background is at least as tall as the document + viewport height
                // This ensures it covers the entire page even during scroll
                const docHeight = Math.max(
                    document.body.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.clientHeight,
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight
                );
                
                bgElement.style.height = `${docHeight}px`;
            }
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