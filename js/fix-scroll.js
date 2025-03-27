/**
 * Fix Scroll Position on Mobile
 * This script ensures the page always starts at the top on refresh
 */
(function() {
    // Function to fix scroll position
    function fixScrollPosition() {
        // Reset scroll position to top
        window.scrollTo(0, 0);
        
        // Force scroll position to top after a slight delay
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 50);
        
        // Additional check for iOS Safari and other mobile browsers
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 150);
    }
    
    // Fix on DOMContentLoaded (page load)
    document.addEventListener('DOMContentLoaded', fixScrollPosition);
    
    // Fix on page show (this catches refresh actions too)
    window.addEventListener('pageshow', function(event) {
        // If the page is loaded from the cache (back/forward navigation or refresh)
        if (event.persisted) {
            fixScrollPosition();
        }
    });
    
    // History API navigation handling
    window.addEventListener('popstate', fixScrollPosition);
    
    // Additional workaround for iOS
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // iOS-specific fix for scroll restoration
        window.addEventListener('resize', function() {
            if (document.activeElement.tagName !== 'INPUT') {
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            }
        });
    }
    
    // Reset any automatic scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
})();
