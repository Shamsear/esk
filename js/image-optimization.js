/**
 * Image Optimization Script
 * Handles:
 * - WebP format detection and usage
 * - Responsive image loading
 * - Image compression
 * - Image loading prioritization
 */

// Check for WebP support
function checkWebpSupport() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        // Check for WebP format support by attempting to encode and decode
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

// Add WebP support class to document for CSS targeting
document.addEventListener('DOMContentLoaded', function() {
    if (checkWebpSupport()) {
        document.documentElement.classList.add('webp-support');
    } else {
        document.documentElement.classList.add('no-webp-support');
    }
    
    // Apply responsive image handling
    setupResponsiveImages();
    
    // Prioritize visible images
    prioritizeVisibleImages();
});

// Set up responsive images based on viewport and screen resolution
function setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-srcset]');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    
    images.forEach(img => {
        if (!img.dataset.srcset) return;
        
        // Parse srcset attribute
        const srcsetEntries = img.dataset.srcset.split(',');
        let bestSrc = '';
        let bestWidth = 0;
        
        srcsetEntries.forEach(entry => {
            const [url, width] = entry.trim().split(' ');
            const widthValue = parseInt(width.replace('w', ''));
            
            // Select appropriate image based on viewport and pixel ratio
            if (widthValue >= viewportWidth * devicePixelRatio && 
                (bestWidth === 0 || widthValue < bestWidth)) {
                bestWidth = widthValue;
                bestSrc = url;
            }
        });
        
        // If no matching size found, use the largest available
        if (!bestSrc && srcsetEntries.length > 0) {
            const lastEntry = srcsetEntries[srcsetEntries.length - 1].trim().split(' ');
            bestSrc = lastEntry[0];
        }
        
        // If webp support is available and there's a webp version, use it
        if (checkWebpSupport() && img.dataset.srcsetWebp) {
            const webpSrcsetEntries = img.dataset.srcsetWebp.split(',');
            
            webpSrcsetEntries.forEach(entry => {
                const [url, width] = entry.trim().split(' ');
                const widthValue = parseInt(width.replace('w', ''));
                
                if (widthValue === bestWidth) {
                    bestSrc = url;
                }
            });
        }
        
        // Set the appropriate source when in viewport
        if (bestSrc) {
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.src = bestSrc;
                            observer.unobserve(entry.target);
                        }
                    });
                });
                
                observer.observe(img);
            } else {
                // Fallback for older browsers
                img.src = bestSrc;
            }
        }
    });
}

// Prioritize images that are in the viewport
function prioritizeVisibleImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Set high fetchpriority for visible images
                    img.fetchPriority = 'high';
                    
                    // Remove low quality placeholder if it exists
                    if (img.classList.contains('lazy-placeholder')) {
                        // Get the corresponding high quality image
                        const highQualityImg = img.parentElement.querySelector('.high-quality');
                        if (highQualityImg && highQualityImg.dataset.src) {
                            highQualityImg.src = highQualityImg.dataset.src;
                            highQualityImg.style.opacity = 1;
                            
                            // Fade out placeholder
                            img.style.opacity = 0;
                            setTimeout(() => {
                                img.remove();
                            }, 500);
                        }
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px' // Start loading a bit before they come into view
        });
        
        // Observe all images
        document.querySelectorAll('img').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Apply LQIP (Low Quality Image Placeholders) pattern for main images
function setupLQIP() {
    const imageContainers = document.querySelectorAll('.lqip-container');
    
    imageContainers.forEach(container => {
        const placeholder = container.querySelector('.lazy-placeholder');
        const highQualityImg = container.querySelector('.high-quality');
        
        if (placeholder && highQualityImg && highQualityImg.dataset.src) {
            // Preload high quality image
            const img = new Image();
            img.onload = function() {
                // When high quality image is loaded, swap them
                highQualityImg.src = highQualityImg.dataset.src;
                highQualityImg.style.opacity = 1;
                
                // Fade out placeholder
                placeholder.style.opacity = 0;
                setTimeout(() => {
                    placeholder.remove();
                }, 500);
            };
            
            // Start loading the image when in viewport
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            img.src = highQualityImg.dataset.src;
                            observer.unobserve(container);
                        }
                    });
                });
                
                observer.observe(container);
            } else {
                // Fallback for older browsers
                img.src = highQualityImg.dataset.src;
            }
        }
    });
}

// Function to convert background images for better performance
function optimizeBackgroundImages() {
    const elements = document.querySelectorAll('[data-background]');
    
    elements.forEach(el => {
        if (el.dataset.background) {
            // Choose format based on support
            let bgUrl = el.dataset.background;
            
            if (checkWebpSupport() && el.dataset.backgroundWebp) {
                bgUrl = el.dataset.backgroundWebp;
            }
            
            // Only load when in viewport
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Set the background image
                            el.style.backgroundImage = `url(${bgUrl})`;
                            observer.unobserve(el);
                        }
                    });
                });
                
                observer.observe(el);
            } else {
                // Fallback for older browsers
                el.style.backgroundImage = `url(${bgUrl})`;
            }
        }
    });
}

// Initialize all optimizations
document.addEventListener('DOMContentLoaded', function() {
    setupLQIP();
    optimizeBackgroundImages();
    
    // Re-check when window is resized
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            setupResponsiveImages();
        }, 300);
    });
}); 