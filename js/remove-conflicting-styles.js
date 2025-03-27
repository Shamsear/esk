/**
 * Remove Conflicting Background Styles
 * 
 * This script finds and removes any background-related inline styles 
 * from the style tags inside HTML files.
 * It should be run before background-fix.js for best results.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find all style tags in the document
    const styleElements = document.querySelectorAll('style');
    
    // Process each style tag
    styleElements.forEach(style => {
        // Skip if it's our own background-fix style
        if (style.getAttribute('data-background-fix') === 'true') {
            return;
        }
        
        // Get the CSS content
        let cssText = style.textContent;
        
        // Check if this style block contains conflicting background styles
        if (cssText.includes('background-image') || 
            cssText.includes('background-attachment') || 
            cssText.includes('background-position') || 
            cssText.includes('background-repeat') || 
            cssText.includes('background-size')) {
            
            // Replace conflicting properties in body selector
            const bodyCssPattern = /body\s*{[^}]*}/g;
            const bodyMatches = cssText.match(bodyCssPattern);
            
            if (bodyMatches) {
                bodyMatches.forEach(match => {
                    // Create a new version of the body styles with background properties removed or commented out
                    let newBodyStyle = match;
                    
                    // Comment out background-related properties
                    newBodyStyle = newBodyStyle.replace(/(background-image:[^;]+;)/g, '/* $1 */');
                    newBodyStyle = newBodyStyle.replace(/(background-attachment:[^;]+;)/g, '/* $1 */');
                    newBodyStyle = newBodyStyle.replace(/(background-position:[^;]+;)/g, '/* $1 */');
                    newBodyStyle = newBodyStyle.replace(/(background-repeat:[^;]+;)/g, '/* $1 */');
                    newBodyStyle = newBodyStyle.replace(/(background-size:[^;]+;)/g, '/* $1 */');
                    
                    // Update the CSS text with the new body style
                    cssText = cssText.replace(match, newBodyStyle);
                });
                
                // Update the style element with the modified CSS
                style.textContent = cssText;
            }
        }
    });
    
    // Add a console log for debugging
    console.log('✓ Removed conflicting background styles');
}); 