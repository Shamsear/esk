/**
 * Script to update all HTML files to include background-mobile-scroll.js script
 * Run with Node.js: node update-background-script.js
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

// Update each HTML file to include the background-mobile-scroll.js script
function updateHtmlFiles() {
    const htmlFiles = getFiles('.', '.html');
    let updatedCount = 0;
    
    for (const file of htmlFiles) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Add background-mobile-scroll.js if not already present
        if (!content.includes('background-mobile-scroll.js')) {
            // Find the position right before background-fix.js
            const backgroundFixPos = content.indexOf('background-fix.js');
            
            if (backgroundFixPos !== -1) {
                // Find the script tag opening position
                const scriptTagPos = content.lastIndexOf('<script', backgroundFixPos);
                
                if (scriptTagPos !== -1) {
                    // Insert our script right before background-fix.js
                    content = 
                        content.substring(0, scriptTagPos) + 
                        '<script src="js/background-mobile-scroll.js"></script>\n    ' +
                        content.substring(scriptTagPos);
                    modified = true;
                }
            }
        }
        
        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            updatedCount++;
            console.log(`Updated ${file}`);
        } else {
            console.log(`${file} already has the script reference or couldn't be updated`);
        }
    }
    
    console.log(`\nUpdated ${updatedCount} HTML files with background-mobile-scroll.js reference`);
}

console.log('Updating HTML files to include background-mobile-scroll.js...');
updateHtmlFiles(); 