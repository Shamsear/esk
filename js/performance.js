// Performance optimization script

// Immediately-invoked function for critical performance optimizations
(function() {
    // Mark document with js-loading class
    document.documentElement.classList.add('js-loading');
    
    // Add resource hints for critical domains
    function addResourceHints() {
        const domains = [];
        
        // Add preconnect for Google Fonts if used
        if (document.querySelector('link[href*="fonts.googleapis.com"]')) {
            domains.push('https://fonts.googleapis.com', 'https://fonts.gstatic.com');
        }
        
        // Add preconnect for any third-party resources detected in the page
        document.querySelectorAll('link[href^="http"], script[src^="http"], img[src^="http"]').forEach(el => {
            try {
                const domain = new URL(el.href || el.src).origin;
                if (!domains.includes(domain) && domain !== window.location.origin) {
                    domains.push(domain);
                }
            } catch (e) {}
        });
        
        // Create preconnect links
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    // Execute early optimizations
    addResourceHints();
})();

document.addEventListener('DOMContentLoaded', function() {
    // Fix for mobile and desktop background image
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Initial background setup with fixed positioning
    // Only set background if we have a valid path
    const backgroundPath = '../assets/images/home/background.webp';
    if (backgroundPath) {
        document.body.style.cssText = `
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-position: center top;
            background-color: #000;
            min-height: 100vh;
        `;
    }

    // Optimize fonts
    if ('fonts' in document) {
        // Optimize font loading with font-display
        document.fonts.ready.then(() => {
            document.documentElement.classList.add('fonts-loaded');
        });
    }
    
    // Set fade out for preloader
    window.addEventListener('load', function() {
        // Remove js-loading class to reveal images
        document.documentElement.classList.remove('js-loading');
        
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            setTimeout(function() {
                preloader.style.opacity = '0';
                setTimeout(function() {
                    preloader.style.display = 'none';
                }, 500);
            }, 500);
        }
        
        // Add Interaction Observer for animations
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        animationObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });
            
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                animationObserver.observe(el);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                el.classList.add('visible');
            });
        }
    });
    
    // Defer non-critical resources
    function deferNonCriticalResources() {
        // Identify non-critical resources
        const nonCritical = document.querySelectorAll('link[data-priority="low"], script[data-priority="low"]');
        
        // Create a load queue for these resources
        const loadQueue = [];
        nonCritical.forEach(resource => {
            const type = resource.tagName.toLowerCase();
            const src = resource.href || resource.src;
            const loadLater = document.createElement(type);
            
            // Copy attributes
            Array.from(resource.attributes).forEach(attr => {
                if (attr.name !== 'data-priority') {
                    loadLater.setAttribute(attr.name, attr.value);
                }
            });
            
            // Remove the original resource
            resource.remove();
            
            // Add to queue
            loadQueue.push(loadLater);
        });
        
        // Load resources after page load
        if (loadQueue.length > 0) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loadQueue.forEach(resource => {
                        document.head.appendChild(resource);
                    });
                }, 1000); // Delay by 1 second after load
            });
        }
    }
    
    // Optimize media loading
    function optimizeMediaLoading() {
        // Defer video loading
        setTimeout(function() {
            const videos = document.querySelectorAll('video[data-src]');
            videos.forEach(video => {
                if (video && video.dataset.src) {
                    const source = document.createElement('source');
                    source.src = video.dataset.src;
                    source.type = video.dataset.type || 'video/mp4';
                    video.appendChild(source);
                    video.load();
                    if (video.dataset.autoplay === 'true') {
                        video.play().catch(e => console.log('Autoplay prevented:', e));
                    }
                }
            });
        }, 1000);
        
        // Optimize iframes
        document.querySelectorAll('iframe').forEach(iframe => {
            // Add loading="lazy" attribute to iframes
            if ('loading' in HTMLIFrameElement.prototype) {
                iframe.loading = 'lazy';
            } else {
                // Fallback - load iframes after page load
                iframe.dataset.src = iframe.src;
                iframe.src = 'about:blank';
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        iframe.src = iframe.dataset.src;
                    }, 2000);
                });
            }
        });
    }
    
    // Execute optimizations
    deferNonCriticalResources();
    optimizeMediaLoading();
    
    // Add support for reduced motion preference
    function handleReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('reduced-motion');
            
            // Stop animations
            const style = document.createElement('style');
            style.textContent = `
                * {
                    animation-duration: 0.001ms !important;
                    transition-duration: 0.001ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    handleReducedMotion();
    
    // Monitor performance metrics
    if ('performance' in window && 'PerformanceObserver' in window) {
        // Observe LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime / 1000, 'seconds');
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Observe FID (First Input Delay)
        const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime, 'ms');
            });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        // Observe CLS (Cumulative Layout Shift)
        let clsValue = 0;
        let clsEntries = [];
        const clsObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                // Only count layout shifts without recent user input
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    clsEntries.push(entry);
                }
            });
            console.log('CLS:', clsValue);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
    }
}); 