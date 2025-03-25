/**
 * Performance optimization script
 * This file handles various performance enhancements:
 * - Lazy loading for images and videos
 * - Resource prefetching
 * - Animation throttling for low-end devices
 * - Memory management
 */

// Initialize performance optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Detect device capabilities
    const isLowEndDevice = detectLowEndDevice();
    
    // Apply appropriate optimizations
    if (isLowEndDevice) {
        applyLowEndOptimizations();
    }
    
    // Setup lazy loading for images
    setupLazyLoading();
    
    // Defer non-critical resources
    deferNonCriticalResources();
    
    // Clean up event listeners and optimize animations when page becomes visible
    optimizePageVisibility();
});

/**
 * Detect if the user is on a low-end device
 * @returns {boolean} True if device is considered low-end
 */
function detectLowEndDevice() {
    // Check device memory (if available in browser)
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    
    // Check CPU cores (if available)
    const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Battery status check (if supported)
    let lowBattery = false;
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            lowBattery = battery.level < 0.15 && !battery.charging;
        });
    }
    
    // Return true if multiple indicators suggest a low-end device
    return (lowMemory && lowCPU) || (isMobile && (lowMemory || lowCPU || lowBattery));
}

/**
 * Apply specific optimizations for low-end devices
 */
function applyLowEndOptimizations() {
    console.log('Applying optimizations for low-end device');
    
    // Reduce animation complexity
    document.body.classList.add('reduce-motion');
    
    // Disable particle effects
    const particles = document.getElementById('particles-js');
    if (particles) {
        particles.style.display = 'none';
    }
    
    // Simplify video background
    const videoBg = document.querySelector('.video-bg');
    if (videoBg) {
        videoBg.remove();
    }
    
    // Reduce the image quality for faster loading
    document.querySelectorAll('img:not(.logo)').forEach(img => {
        if (img.src.includes('.jpg') || img.src.includes('.png')) {
            // Switch to lower quality versions or add a quality parameter
            img.src = img.src.replace('.jpg', '-low.jpg').replace('.png', '-low.png');
        }
    });
}

/**
 * Setup lazy loading for images and other content
 */
function setupLazyLoading() {
    // Lazy load images on modern browsers with IntersectionObserver
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load the real image source
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Load srcset if available
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }
                    
                    // Stop observing after loading
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Target all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Also handle background images with data-bg attribute
        const bgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.dataset.bg) {
                        element.style.backgroundImage = `url(${element.dataset.bg})`;
                        element.removeAttribute('data-bg');
                        observer.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Apply to elements with data-bg
        document.querySelectorAll('[data-bg]').forEach(el => {
            bgObserver.observe(el);
        });
    } else {
        // Fallback for older browsers without IntersectionObserver
        function lazyLoadImagesOnScroll() {
            document.querySelectorAll('img[data-src]').forEach(img => {
                if (isElementInViewport(img)) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
            
            document.querySelectorAll('[data-bg]').forEach(el => {
                if (isElementInViewport(el)) {
                    el.style.backgroundImage = `url(${el.dataset.bg})`;
                    el.removeAttribute('data-bg');
                }
            });
        }
        
        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(function() {
                    lazyLoadImagesOnScroll();
                    scrollTimeout = null;
                }, 100);
            }
        });
        
        // Initial load check
        lazyLoadImagesOnScroll();
    }
}

/**
 * Defer loading of non-critical resources
 */
function deferNonCriticalResources() {
    // Load video backgrounds after page load
    window.addEventListener('load', function() {
        setTimeout(function() {
            const videos = document.querySelectorAll('video[data-src]');
            videos.forEach(video => {
                if (video.dataset.src) {
                    const source = document.createElement('source');
                    source.src = video.dataset.src;
                    source.type = 'video/mp4';
                    video.appendChild(source);
                    video.load();
                    video.play().catch(e => console.log('Autoplay prevented:', e));
                }
            });
        }, 1000);
    });
    
    // Preload pages on hover or touch
    document.querySelectorAll('a[href^="http"], a[href^="/"]').forEach(link => {
        link.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            // Only preload same-origin links
            if (href && href.indexOf(window.location.hostname) !== -1) {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'document';
                preloadLink.href = href;
                document.head.appendChild(preloadLink);
            }
        });
    });
}

/**
 * Optimize performance when page visibility changes
 */
function optimizePageVisibility() {
    // Stop animations and heavy processes when page is not visible
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Pause videos
            document.querySelectorAll('video').forEach(video => {
                if (!video.paused) video.pause();
            });
            
            // Pause animations by adding a class
            document.body.classList.add('page-hidden');
            
            // Stop any CPU intensive animations
            if (window.particlesJS) {
                const particles = document.getElementById('particles-js');
                if (particles) particles.style.visibility = 'hidden';
            }
        } else {
            // Resume videos if they were playing
            document.querySelectorAll('video').forEach(video => {
                if (video.classList.contains('autoplay')) {
                    video.play().catch(e => {});
                }
            });
            
            // Resume animations
            document.body.classList.remove('page-hidden');
            
            // Resume CPU intensive animations
            if (window.particlesJS) {
                const particles = document.getElementById('particles-js');
                if (particles) particles.style.visibility = 'visible';
            }
        }
    });
}

/**
 * Check if element is in viewport
 * @param {Element} el - The DOM element to check
 * @returns {boolean} True if element is at least partially in viewport
 */
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.bottom >= 0 &&
        rect.right >= 0
    );
}

// Create a global resizeObserver to handle layout shifts more efficiently
if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            // Add a small delay to avoid constant recalculations
            clearTimeout(entry.target.resizeTimeout);
            entry.target.resizeTimeout = setTimeout(() => {
                // Trigger any necessary layout updates
                entry.target.dispatchEvent(new CustomEvent('optimizedResize'));
            }, 100);
        }
    });
    
    // Observe main content containers
    document.querySelectorAll('.navigation, main, header').forEach(el => {
        resizeObserver.observe(el);
    });
} 