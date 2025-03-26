/**
 * Fix footer spacing issues on all pages
 * This script dynamically applies CSS to fix the common issue 
 * of extra space appearing below the footer
 */
document.addEventListener('DOMContentLoaded', function() {
    // Create a style element
    const style = document.createElement('style');
    
    // Add CSS rules to fix footer spacing
    style.textContent = `
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }
        
        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        
        .overlay {
            flex: 1 0 auto;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
        }
        
        main {
            flex: 1 0 auto;
        }
        
        footer {
            flex-shrink: 0;
            margin-top: auto;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
        }
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
    
    // Check if there's space below the footer
    const fixSpaceBelowFooter = () => {
        const body = document.body;
        const html = document.documentElement;
        const footer = document.querySelector('footer');
        
        if (footer) {
            // Get the position of the bottom of the footer
            const footerBottom = footer.getBoundingClientRect().bottom + window.scrollY;
            
            // Get the total height of the page
            const docHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
            
            // If there's space below the footer
            if (footerBottom < docHeight) {
                // Force the body to be exactly as tall as needed
                document.body.style.minHeight = '100vh';
                document.body.style.height = 'auto';
            }
        }
    };
    
    // Run the fix immediately and on resize
    fixSpaceBelowFooter();
    window.addEventListener('resize', fixSpaceBelowFooter);
}); 
 