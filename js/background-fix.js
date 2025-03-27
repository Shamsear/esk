/**
 * Background Image Fix for All Pages
 * This script ensures consistent background image behavior across all HTML files
 */
document.addEventListener('DOMContentLoaded', function() {
    // Create a pseudo-element for the background if not already added by CSS
    // This will handle pages using inline styles
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
            background-image: url('assets/images/logo.webp');
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
    
    // Remove any inline background styles on the body to ensure consistent behavior
    document.body.style.backgroundImage = 'none';
}); 