/**
 * Script to inject performance optimizations into all HTML pages
 * 
 * This script:
 * 1. Adds the service worker registration
 * 2. Adds performance.js script
 * 3. Adds Vercel Analytics script
 * 4. Optimizes image loading with width and height attributes
 * 5. Converts synchronous scripts to deferred loading
 * 6. Adds critical CSS link
 */

const fs = require('fs');
const path = require('path');

// Get all HTML files in the directory
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
console.log(`Found ${htmlFiles.length} HTML files to process`);

// Script tags to inject before the closing body tag
const performanceScripts = `
    <!-- Service worker registration -->
    <script defer src="js/sw-register.js"></script>
    
    <!-- Performance optimizations -->
    <script defer src="js/performance.js"></script>
    
    <!-- Vercel Analytics -->
    <script defer src="js/vercel-analytics.js"></script>
`;

// CSS tags to inject in the head
const performanceCSS = `
    <!-- Performance optimized CSS -->
    <link rel="stylesheet" href="css/performance.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="css/performance.css"></noscript>
`;

// Process each HTML file
htmlFiles.forEach(file => {
    console.log(`Processing ${file}...`);
    try {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Add performance scripts if not already present
        if (!content.includes('sw-register.js') && content.includes('</body>')) {
            content = content.replace('</body>', `${performanceScripts}\n</body>`);
            modified = true;
            console.log(`  ✓ Added performance scripts to ${file}`);
        }
        
        // Add performance CSS if not already present
        if (!content.includes('performance.css') && content.includes('</head>')) {
            content = content.replace('</head>', `${performanceCSS}\n</head>`);
            modified = true;
            console.log(`  ✓ Added performance CSS to ${file}`);
        }
        
        // Convert synchronous script loading to deferred loading
        if (content.includes('<script src=') && !content.includes('<script defer src=')) {
            content = content.replace(/<script src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>');
            modified = true;
            console.log(`  ✓ Converted scripts to deferred loading in ${file}`);
        }
        
        // Add PWA support if not already present
        if (!content.includes('<link rel="manifest"') && content.includes('<head>')) {
            const pwaSupport = `
    <!-- PWA support -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#3498db">
    <link rel="apple-touch-icon" href="/assets/images/icon-192x192.png">`;
            
            content = content.replace('<head>', `<head>${pwaSupport}`);
            modified = true;
            console.log(`  ✓ Added PWA support to ${file}`);
        }
        
        // Add missing width and height attributes to images
        let imgCount = 0;
        content = content.replace(/<img([^>]*)src="([^"]+)"([^>]*)>/g, (match, beforeSrc, src, afterSrc) => {
            // Skip if already has width and height
            if ((beforeSrc + afterSrc).includes('width=') && (beforeSrc + afterSrc).includes('height=')) {
                return match;
            }
            
            // Add default width and height for better CLS
            imgCount++;
            return `<img${beforeSrc}src="${src}"${afterSrc} width="300" height="200">`;
        });
        
        if (imgCount > 0) {
            modified = true;
            console.log(`  ✓ Added dimensions to ${imgCount} images in ${file}`);
        }
        
        // Save the file if it was modified
        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`✓ Updated ${file}`);
        } else {
            console.log(`○ No changes needed for ${file}`);
        }
    } catch (error) {
        console.error(`✗ Error processing ${file}:`, error);
    }
});

console.log('Performance improvements complete! All pages optimized.'); 