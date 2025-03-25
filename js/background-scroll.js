// Background scrolling script
document.addEventListener('DOMContentLoaded', function() {
    // Function to ensure the body covers the content properly
    function adjustBodyHeight() {
        // Get the visible content height - only what's needed
        const overlayEl = document.querySelector('.overlay');
        const footerEl = document.querySelector('footer');
        
        if (overlayEl) {
            // Use the overlay height as the basis for body height
            const contentHeight = overlayEl.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Set body height to content height or window height, whichever is greater
            const newHeight = Math.max(contentHeight, windowHeight);
            
            // Ensure the height is reasonable (prevent runaway growth)
            if (newHeight > 0 && newHeight < 10000) {
                document.body.style.minHeight = newHeight + 'px';
                document.body.style.height = newHeight + 'px';
                console.log('Set body height to: ' + newHeight + 'px');
            }
        }
    }
    
    // Run once on page load
    setTimeout(adjustBodyHeight, 1000);
    
    // Run after full page load
    window.addEventListener('load', function() {
        setTimeout(adjustBodyHeight, 1000);
    });
    
    // Run once on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustBodyHeight, 300);
    });
    
    // Disconnect previous observer if exists
    if (window.bodyObserver) {
        window.bodyObserver.disconnect();
    }
    
    // Don't use MutationObserver - it causes continuous height adjustments
}); 