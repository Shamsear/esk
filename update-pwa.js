/**
 * PWA Update Script
 * 
 * This script adds PWA support to all HTML files in the project.
 * Run with: node update-pwa.js
 */

const fs = require('fs');
const path = require('path');

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

// PWA head tags to add
const pwaHeadTags = `
    <!-- PWA support -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#3498db">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Eskimos R2G">
    <link rel="apple-touch-icon" href="/assets/images/logo11.webp">
    <link rel="icon" type="image/webp" sizes="192x192" href="/assets/images/logo11.webp">
    <link rel="icon" type="image/webp" sizes="512x512" href="/assets/images/logo11.webp">
`;

// PWA scripts to add before </body>
const pwaScripts = `
    <!-- PWA scripts -->
    <script src="js/pwa-init.js" defer></script>
    <script src="js/offline-manager.js" defer></script>
`;

// Process each HTML file
htmlFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if file already has PWA support
  if (content.includes('<!-- PWA support -->')) {
    console.log(`  - ${file} already has PWA support`);
    
    // Update icon references in existing PWA tags
    if (content.includes('icon-192x192.webp') || content.includes('.png') || content.includes('.svg')) {
      console.log(`  - Updating icon references in ${file}`);
      
      // Replace any existing icon references with logo11.webp
      content = content.replace(/<link rel="apple-touch-icon"[^>]*>/g, '<link rel="apple-touch-icon" href="/assets/images/logo11.webp">');
      content = content.replace(/<link rel="icon"[^>]*>/g, '<link rel="icon" href="assets/images/logo11.webp" type="image/webp">');
      content = content.replace(/<link rel="shortcut icon"[^>]*>/g, '<link rel="shortcut icon" href="assets/images/logo11.webp" type="image/webp">');
      
      // Write updated content back to file
      fs.writeFileSync(file, content, 'utf8');
      console.log(`  - Updated favicon references in ${file}`);
    }
    
    return;
  }
  
  // Add PWA head tags after <head>
  content = content.replace(/<head>/, '<head>\n' + pwaHeadTags);
  
  // Add PWA scripts before </body>
  content = content.replace(/<\/body>/, pwaScripts + '\n</body>');
  
  // Include pwa.css if not already included
  if (!content.includes('css/pwa.css') && content.includes('<link rel="stylesheet"')) {
    // Find last <link> tag
    const lastLinkIndex = content.lastIndexOf('<link rel="stylesheet"');
    if (lastLinkIndex !== -1) {
      // Find the end of this link tag
      const endOfLinkTag = content.indexOf('>', lastLinkIndex) + 1;
      
      // Insert the new link tag after the last link tag
      content = content.slice(0, endOfLinkTag) + 
                '\n    <link rel="stylesheet" href="css/pwa.css">' + 
                content.slice(endOfLinkTag);
    }
  }
  
  // Fix viewport meta tag for better PWA experience if it exists
  if (content.includes('user-scalable=no')) {
    content = content.replace(
      /<meta name="viewport"[^>]*>/,
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">'
    );
  }
  
  // Replace any existing icon references with logo11.webp
  content = content.replace(/<link rel="apple-touch-icon"[^>]*>/g, '<link rel="apple-touch-icon" href="/assets/images/logo11.webp">');
  content = content.replace(/<link rel="icon"[^>]*>/g, '<link rel="icon" href="assets/images/logo11.webp" type="image/webp">');
  content = content.replace(/<link rel="shortcut icon"[^>]*>/g, '<link rel="shortcut icon" href="assets/images/logo11.webp" type="image/webp">');
  
  // Write updated content back to file
  fs.writeFileSync(file, content, 'utf8');
  console.log(`  - Updated ${file} with PWA support`);
});

console.log('\nAll HTML files have been updated with PWA support.');
console.log('Remember to test your Progressive Web App functionality!'); 