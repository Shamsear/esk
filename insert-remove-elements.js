const fs = require('fs');
const path = require('path');

// Get list of HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

// Script tag to insert
const scriptTag = '    <!-- Remove back-to-top and audio elements -->\n    <script defer src="js/remove-elements.js"></script>\n';

// Process each HTML file
htmlFiles.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        
        // Find the position to insert the script tag (before performance.js)
        const performancePosition = content.indexOf('<script defer src="js/performance.js"></script>');
        
        if (performancePosition !== -1) {
            // Skip if remove-elements.js is already included
            if (content.includes('remove-elements.js')) {
                console.log(`${file}: Script already included`);
                return;
            }
            
            // Insert before performance.js
            const before = content.substring(0, performancePosition);
            const after = content.substring(performancePosition);
            
            content = before + scriptTag + after;
            
            // Write the updated content back to the file
            fs.writeFileSync(file, content);
            console.log(`${file}: Script added successfully`);
        } else {
            console.log(`${file}: Could not find performance.js reference`);
        }
    } catch (error) {
        console.error(`Error processing ${file}:`, error);
    }
});

console.log('Done processing HTML files.'); 