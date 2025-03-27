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
        
        // Check if background-fix.js exists in the file
        const backgroundFixPos = content.indexOf('background-fix.js');
        
        if (backgroundFixPos !== -1) {
            // Find the beginning of the script tag containing background-fix.js
            const scriptStartPos = content.lastIndexOf('<script', backgroundFixPos);
            
            // First, remove any existing background-mobile-scroll.js script
            if (content.includes('background-mobile-scroll.js')) {
                const mobileScriptStartPos = content.indexOf('<script', content.indexOf('background-mobile-scroll.js') - 50);
                const mobileScriptEndPos = content.indexOf('</script>', content.indexOf('background-mobile-scroll.js')) + 9;
                
                if (mobileScriptStartPos !== -1 && mobileScriptEndPos !== -1) {
                    content = content.substring(0, mobileScriptStartPos) + content.substring(mobileScriptEndPos);
                    modified = true;
                }
            }
            
            // Now add the script right before background-fix.js
            if (scriptStartPos !== -1) {
                content = 
                    content.substring(0, scriptStartPos) + 
                    '<script src="js/background-mobile-scroll.js"></script>\n    ' +
                    content.substring(scriptStartPos);
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(file, content, 'utf8');
            updatedCount++;
            console.log(`Updated ${file}`);
        } else {
            console.log(`${file} either doesn't include background-fix.js or couldn't be updated`);
        }
    }
    
    console.log(`\nUpdated ${updatedCount} HTML files with background-mobile-scroll.js reference`);
}

console.log('Updating HTML files to include background-mobile-scroll.js before background-fix.js...');
updateHtmlFiles(); 