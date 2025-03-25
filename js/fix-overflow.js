// Fix overflow and background position issues
document.addEventListener('DOMContentLoaded', function() {
    // We don't need to do anything with background here as it's handled in performance.js
    
    // Fix body height issues
    function monitorAndFixBodyHeight() {
        const body = document.body;
        const html = document.documentElement;
        
        // Get content height (the overlay element)
        const overlayEl = document.querySelector('.overlay');
        const footerEl = document.querySelector('footer');
        
        if (overlayEl) {
            // Calculate a reasonable height
            const viewportHeight = window.innerHeight;
            const contentHeight = overlayEl.getBoundingClientRect().height;
            const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 0;
            
            // Apply reasonable height constraints
            const idealHeight = Math.max(contentHeight, viewportHeight);
            
            // We only adjust if the body height is excessive (fix infinite scrolling bug)
            if (body.offsetHeight > idealHeight * 1.5 || body.offsetHeight < idealHeight) {
                // First try with standard height
                body.style.height = idealHeight + 'px';
                body.style.minHeight = '100vh';
                body.style.maxHeight = idealHeight * 1.2 + 'px';
                console.log('Fixed body height to: ' + idealHeight + 'px');
            }
            
            // Reset margins and padding to ensure consistent behavior
            body.style.margin = '0';
            body.style.padding = '0';
        }
    }
    
    // Fix height immediately and periodically check
    monitorAndFixBodyHeight();
    setInterval(monitorAndFixBodyHeight, 2000);
    
    // Also run on resize
    window.addEventListener('resize', monitorAndFixBodyHeight);
}); 