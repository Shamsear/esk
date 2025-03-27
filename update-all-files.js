/**
 * Script to update all HTML files to include background-fix.js script
 * Run with Node.js: node update-all-files.js
 */

const fs = require('fs');
const path = require('path');

// Get all HTML files
function getFiles(directory, extension, files = []) {
    const filesList = fs.readdirSync(directory);
    
    for (const file of filesList) {
        const fullPath = path.join(directory, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, extension, files);
        } else if (path.extname(file) === extension) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Update each HTML file to include the necessary scripts
function updateHtmlFiles() {
    const htmlFiles = getFiles('.', '.html');
    let updatedCount = 0;
    
    for (const file of htmlFiles) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Add remove-conflicting-styles.js if not already present
        if (!content.includes('remove-conflicting-styles.js')) {
            // Find the position to insert the script (before the closing body tag)
            const scriptPosition = content.lastIndexOf('</body>');
            
            if (scriptPosition !== -1) {
                // If there's an existing script.js reference, add our script after it
                const scriptJsPos = content.lastIndexOf('script.js');
                if (scriptJsPos !== -1 && scriptJsPos < scriptPosition) {
                    const closingScriptTagPos = content.indexOf('</script>', scriptJsPos);
                    if (closingScriptTagPos !== -1 && closingScriptTagPos < scriptPosition) {
                        const insertPosition = closingScriptTagPos + '</script>'.length;
                        content = 
                            content.substring(0, insertPosition) + 
                            '\n    <script src="js/remove-conflicting-styles.js"></script>' +
                            content.substring(insertPosition);
                        modified = true;
                    }
                }
            }
        }
        
        // Add background-fix.js if not already present
        if (!content.includes('background-fix.js')) {
            // Find the position to insert the script (before the closing body tag or after remove-conflicting-styles.js)
            const scriptPosition = content.lastIndexOf('</body>');
            
            if (scriptPosition !== -1) {
                // Check if remove-conflicting-styles.js is already present
                const removeConflictingPos = content.lastIndexOf('remove-conflicting-styles.js');
                
                if (removeConflictingPos !== -1 && removeConflictingPos < scriptPosition) {
                    // Add after remove-conflicting-styles.js
                    const closingScriptTagPos = content.indexOf('</script>', removeConflictingPos);
                    if (closingScriptTagPos !== -1 && closingScriptTagPos < scriptPosition) {
                        const insertPosition = closingScriptTagPos + '</script>'.length;
                        content = 
                            content.substring(0, insertPosition) + 
                            '\n    <script src="js/background-fix.js"></script>' +
                            content.substring(insertPosition);
                        modified = true;
                    }
                } else {
                    // If no remove-conflicting-styles.js, add before closing body tag
                    content = 
                        content.substring(0, scriptPosition) + 
                        '    <script src="js/background-fix.js"></script>\n' +
                        content.substring(scriptPosition);
                    modified = true;
                }
            }
        }
        
        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            updatedCount++;
            console.log(`Updated ${file}`);
        } else {
            console.log(`${file} already has necessary script references`);
        }
    }
    
    console.log(`\nUpdated ${updatedCount} HTML files with necessary script references`);
}

console.log('Updating HTML files to include necessary scripts...');
updateHtmlFiles(); 