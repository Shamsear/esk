/**
 * Background Image Fix for All Pages
 * This script ensures consistent background image behavior across all HTML files
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get current page to determine the correct path to logo.webp
    const currentPath = window.location.pathname;
    const isInSubdirectory = currentPath.split('/').length > 2; 
    
    // Determine the correct path to the background image
    let backgroundPath = 'assets/images/logo.webp';
    
    // If we're in a subdirectory (like /pages/something.html), adjust the path
    if (isInSubdirectory) {
        backgroundPath = '../assets/images/logo.webp';
    }
    
    // Create a pseudo-element for the background if not already added by CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -10;
            background-image: url('${backgroundPath}');
            background-size: contain;
            background-position: center top;
            background-repeat: no-repeat;
            background-color: #000;
        }
        
        @media (max-width: 768px) {
            body {
                background-image: none !important;
            }
            
            body::before {
                background-size: contain;
                background-position: top center;
                background-attachment: fixed;
            }
            
            @supports (-webkit-touch-callout: none) {
                body::before {
                    background-attachment: scroll;
                    background-position: top center;
                }
            }
        }
    `;
    
    // Add style to head if not already present
    if (!document.querySelector('style[data-background-fix="true"]')) {
        styleElement.setAttribute('data-background-fix', 'true');
        document.head.appendChild(styleElement);
    }
    
    // Remove all inline background styles from the body to avoid conflicts
    const propsToRemove = [
        'backgroundImage',
        'backgroundAttachment',
        'backgroundPosition',
        'backgroundRepeat',
        'backgroundSize'
    ];
    
    // Remove the inline styles that would conflict with our solution
    propsToRemove.forEach(prop => {
        document.body.style[prop] = '';
    });
    
    // Find and update any inline style in the HTML files
    const inlineStyles = document.querySelectorAll('style');
    inlineStyles.forEach(style => {
        if (style.getAttribute('data-background-fix') !== 'true') {
            // Only modify styles with background-image properties but preserve the style element
            let cssText = style.textContent;
            if (cssText.includes('background-image') && cssText.includes('logo.webp')) {
                // Replace background properties in body selector
                cssText = cssText.replace(/body\s*{[^}]*background-image[^}]*}/g, 'body { }');
                cssText = cssText.replace(/body\s*{[^}]*background-attachment[^}]*}/g, 'body { }');
                style.textContent = cssText;
            }
        }
    });
}); 