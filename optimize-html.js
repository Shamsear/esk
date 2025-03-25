const fs = require('fs');
const path = require('path');

// Get all HTML files in directory
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
console.log(`Found ${htmlFiles.length} HTML files to optimize`);

// Performance improvements to apply
const optimizations = {
    // Add viewport meta tag with proper settings
    viewportTag: '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">',
    viewportRegex: /<meta\s+name=["']viewport["'][^>]*>/i,
    
    // Add DNS prefetch and preconnect
    dnsPrefetch: `
    <!-- DNS prefetch and preconnect -->
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
    <link rel="dns-prefetch" href="https://assets.mixkit.co">
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>`,
    
    // Optimize font loading
    fontLoading: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" media="print" onload="this.media=\'all\'" crossorigin>',
    fontLoadingRegex: /<link[^>]*fonts\.googleapis\.com[^>]*>/i,
    
    // Optimize icon font loading
    iconLoading: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" media="print" onload="this.media=\'all\'" crossorigin>',
    iconLoadingRegex: /<link[^>]*font-awesome[^>]*>/i,
    
    // Optimize video loading
    videoRegex: /<video[^>]*class=["']video-bg["'][^>]*>[\s\S]*?<source src="([^"]+)"[^>]*>[\s\S]*?<\/video>/i,
    videoReplacement: '<video class="video-bg" autoplay muted loop playsinline preload="none" data-src="$1"></video>',
    
    // Add performance JS
    performanceJS: `
    <!-- Performance optimization JS -->
    <script>
        // Immediately executed critical JS
        document.addEventListener('DOMContentLoaded', function() {
            // Load the video after page content
            setTimeout(function() {
                const video = document.querySelector('.video-bg');
                if (video && video.dataset.src) {
                    const source = document.createElement('source');
                    source.src = video.dataset.src;
                    source.type = 'video/mp4';
                    video.appendChild(source);
                    video.load();
                    video.play().catch(e => console.log('Autoplay prevented:', e));
                }
            }, 1000);
            
            // Set fade out for preloader
            window.addEventListener('load', function() {
                const preloader = document.querySelector('.preloader');
                if (preloader) {
                    setTimeout(function() {
                        preloader.style.opacity = '0';
                        setTimeout(function() {
                            preloader.style.display = 'none';
                        }, 500);
                    }, 500);
                }
            });
        });
    </script>`,
    
    // Defer scripts
    scriptTags: /<script\s+src=["']([^"']+)["']\s*><\/script>/gi,
    scriptReplacement: '<script defer src="$1"></script>',
    
    // Add performance.js script
    performanceJsScript: '<script defer src="js/performance.js"></script>',
};

// Process each HTML file
htmlFiles.forEach(file => {
    console.log(`Optimizing ${file}...`);
    try {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Replace viewport meta tag
        if (optimizations.viewportRegex.test(content)) {
            content = content.replace(optimizations.viewportRegex, optimizations.viewportTag);
            modified = true;
        }
        
        // Add DNS prefetch after head tag if not already present
        if (!content.includes('dns-prefetch') && content.includes('<head>')) {
            content = content.replace('<head>', '<head>\n' + optimizations.dnsPrefetch);
            modified = true;
        }
        
        // Optimize font loading
        if (optimizations.fontLoadingRegex.test(content)) {
            content = content.replace(optimizations.fontLoadingRegex, optimizations.fontLoading);
            // Add noscript fallback if not present
            if (!content.includes('<noscript><link rel="stylesheet" href="https://fonts.googleapis.com')) {
                content = content.replace(optimizations.fontLoading, 
                    optimizations.fontLoading + '\n    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap"></noscript>');
            }
            modified = true;
        }
        
        // Optimize icon font loading
        if (optimizations.iconLoadingRegex.test(content)) {
            content = content.replace(optimizations.iconLoadingRegex, optimizations.iconLoading);
            // Add noscript fallback if not present
            if (!content.includes('<noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/')) {
                content = content.replace(optimizations.iconLoading, 
                    optimizations.iconLoading + '\n    <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"></noscript>');
            }
            modified = true;
        }
        
        // Optimize video loading
        if (optimizations.videoRegex.test(content)) {
            content = content.replace(optimizations.videoRegex, optimizations.videoReplacement);
            modified = true;
        }
        
        // Add performance JS before body close if not present
        if (!content.includes('// Immediately executed critical JS') && content.includes('</body>')) {
            content = content.replace('</body>', optimizations.performanceJS + '\n    \n</body>');
            modified = true;
        }
        
        // Defer script loading
        const originalContent = content;
        content = content.replace(optimizations.scriptTags, optimizations.scriptReplacement);
        if (originalContent !== content) {
            modified = true;
        }
        
        // Add performance.js script if not present
        if (!content.includes('performance.js') && content.includes('</body>')) {
            content = content.replace('</body>', '    <!-- Load performance optimizations -->\n    ' + 
                optimizations.performanceJsScript + '\n</body>');
            modified = true;
        }
        
        // Add background-scroll.js script if not present
        if (!content.includes('background-scroll.js') && content.includes('</body>')) {
            content = content.replace('</body>', '    <!-- Load background scroll handling -->\n    ' + 
                '<script defer src="js/background-scroll.js"></script>\n</body>');
            modified = true;
        }
        
        // Save the file if it was modified
        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`✓ Optimized ${file}`);
        } else {
            console.log(`○ No changes needed for ${file}`);
        }
    } catch (error) {
        console.error(`✗ Error processing ${file}:`, error);
    }
});

console.log('Optimization complete!'); 