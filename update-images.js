const fs = require('fs');
const path = require('path');

// List of all HTML files to update
const htmlFiles = [
  'index.html',
  'player-status.html',
  'admin-login.html',
  'career-mode.html',
  'career-tournament.html',
  'manager-ranking.html',
  'offline.html',
  'player-signing.html',
  'player-admin.html',
  'registered-clubs.html',
  'tournament-guide.html',
  'trophy-cabinet.html',
  'carhome.html',
  'token-setup.html',
  'test-json-loading.html'
];

// Critical code to add to all pages
const webpSupportCode = `
    <!-- Check for WebP support -->
    <script>
      (function() {
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
          const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
          if (isWebPSupported) {
            document.documentElement.classList.add('webp-support');
          } else {
            document.documentElement.classList.add('no-webp-support');
          }
        }
      })();
    </script>
`;

// Resource hints to add
const resourceHints = `
    <!-- Resource hints -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    <link rel="preconnect" href="https://assets.mixkit.co" crossorigin>
`;

// Update HTML files
htmlFiles.forEach(file => {
  try {
    // Check if file exists
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`);
      return;
    }

    console.log(`Processing ${file}...`);
    let content = fs.readFileSync(file, 'utf8');
    
    // Add js-loading class to html tag if it doesn't have it
    content = content.replace(/<html([^>]*)>/i, (match, attrs) => {
      if (!/class=/.test(attrs)) {
        return `<html${attrs} class="js-loading">`;
      } else if (!/js-loading/.test(attrs)) {
        return match.replace(/class="([^"]*)"/i, 'class="$1 js-loading"');
      }
      return match;
    });

    // Add WebP support detection if not present
    if (!content.includes('webp-support')) {
      const headEnd = content.indexOf('</head>');
      if (headEnd !== -1) {
        content = content.slice(0, headEnd) + webpSupportCode + content.slice(headEnd);
      }
    }
    
    // Add resource hints if not present
    if (!content.includes('Resource hints')) {
      const metaEnd = content.lastIndexOf('</meta>') || content.indexOf('</title>');
      if (metaEnd !== -1) {
        content = content.slice(0, metaEnd + 8) + resourceHints + content.slice(metaEnd + 8);
      }
    }
    
    // Convert picture tags to simple img tags with WebP
    content = content.replace(/<picture>[\s\S]*?<source[^>]*srcset="([^"]*\.webp)"[^>]*>[\s\S]*?<img([^>]*)>[^<]*<\/picture>/gi, (match, webpSrc, imgAttrs) => {
      // Extract the src and other attributes from img tag
      return `<img${imgAttrs.replace(/src="[^"]*"/i, `src="${webpSrc}"`)} loading="lazy">`;
    });
    
    // Update any non-WebP image sources
    content = content.replace(/src="([^"]*\.(jpe?g|png|gif))"/gi, (match, src) => {
      const webpSrc = src.replace(/\.(jpe?g|png|gif)$/i, '.webp');
      return `src="${webpSrc}"`;
    });
    
    // Add fetchpriority to critical images
    content = content.replace(/<img([^>]*class="[^"]*logo[^"]*"[^>]*)>/gi, (match, attrs) => {
      if (!/fetchpriority=/.test(attrs)) {
        return `<img${attrs} fetchpriority="high" class="critical">`;
      }
      return match;
    });
    
    // Add priority for CSS/JS loading
    content = content.replace(/<link rel="stylesheet"([^>]*)>/gi, (match, attrs) => {
      if (attrs.includes('critical.css')) {
        return `<link rel="stylesheet"${attrs} fetchpriority="high">`;
      } else if (!attrs.includes('fetchpriority')) {
        return `<link rel="stylesheet"${attrs} fetchpriority="low" data-priority="low">`;
      }
      return match;
    });
    
    // Update script loading
    content = content.replace(/<script src="([^"]*)"([^>]*)><\/script>/gi, (match, src, attrs) => {
      if (!attrs.includes('defer') && !attrs.includes('async')) {
        return `<script defer src="${src}"${attrs}></script>`;
      }
      return match;
    });
    
    // Ensure image-optimization.js is loaded
    if (!content.includes('js/image-optimization.js')) {
      const beforeBodyEnd = content.lastIndexOf('</body>');
      if (beforeBodyEnd !== -1) {
        content = content.slice(0, beforeBodyEnd) + '\n    <!-- Image optimization -->\n    <script defer src="js/image-optimization.js"></script>\n' + content.slice(beforeBodyEnd);
      }
    }
    
    // Ensure performance.js is loaded
    if (!content.includes('js/performance.js')) {
      const beforeBodyEnd = content.lastIndexOf('</body>');
      if (beforeBodyEnd !== -1) {
        content = content.slice(0, beforeBodyEnd) + '\n    <!-- Performance optimization -->\n    <script defer src="js/performance.js"></script>\n' + content.slice(beforeBodyEnd);
      }
    }
    
    // Save the updated file
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
});

console.log('All HTML files have been updated to use WebP format and performance optimizations.');
