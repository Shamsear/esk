// Mobile Device Detection and Animation Optimization
document.addEventListener('DOMContentLoaded', function() {
    detectMobileDevice();
    addMobileOptimizations();
});

// Detect mobile device and set appropriate classes
function detectMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const isLowPowerDevice = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Add specific classes based on device capability
    if (isMobile) {
        document.body.classList.add('is-mobile');
    }
    
    if (isLowPowerDevice) {
        document.body.classList.add('is-low-power');
    }
    
    if (isReducedMotion) {
        document.body.classList.add('reduced-motion');
    }
    
    // Optimize based on connection type if available
    if (navigator.connection) {
        if (navigator.connection.saveData) {
            document.body.classList.add('save-data');
        }
        
        if (navigator.connection.effectiveType) {
            document.body.classList.add('connection-' + navigator.connection.effectiveType);
        }
    }
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', function() {
        // Small timeout to ensure proper recalculation after orientation change
        setTimeout(optimizeAfterOrientationChange, 300);
    });
    
    // If device has high dpi, add specific class
    if (window.devicePixelRatio > 1) {
        document.body.classList.add('high-dpi');
    }
    
    // Debug info for developers
    console.log('Device detection: Mobile = ' + isMobile + ', Low power = ' + isLowPowerDevice + ', Reduced motion = ' + isReducedMotion);
}

// Optimize page after orientation change
function optimizeAfterOrientationChange() {
    // Recalculate animations and elements positions
    const elements = document.querySelectorAll('.scroll-fade-in, .scroll-fade-left, .scroll-fade-right, .scroll-zoom-in');
    
    elements.forEach(el => {
        // Reset animated elements to improve performance after orientation change
        if (el.classList.contains('active')) {
            el.style.transition = 'none';
            el.style.transform = 'none';
            el.style.opacity = '1';
            
            // Force reflow
            void el.offsetWidth;
            
            // Restore transition
            setTimeout(() => {
                el.style.transition = '';
            }, 50);
        }
    });
}

// Add mobile-specific optimizations
function addMobileOptimizations() {
    const isMobile = document.body.classList.contains('is-mobile');
    const isLowPower = document.body.classList.contains('is-low-power');
    
    // Skip if not on mobile
    if (!isMobile) return;
    
    // Apply mobile-specific optimizations
    document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* Mobile performance optimizations */
        body.is-mobile {
            /* Reduce animation complexity */
            --animation-time: 0.3s;
        }
        
        body.is-mobile .video-bg {
            /* Simplify video background */
            transform: none !important;
        }
        
        /* Reduce particles count on mobile */
        body.is-mobile #particles-js canvas {
            opacity: 0.5;
        }
        
        /* Optimize transitions for touch devices */
        body.is-mobile a, 
        body.is-mobile button {
            transition-duration: 0.2s;
        }
        
        /* Disable hover effects that cause lag on mobile */
        body.is-mobile .nav-card:hover {
            transform: none !important;
        }
        
        /* Disable parallax effects completely on low power devices */
        body.is-low-power [class*="parallax"] {
            transition: none !important;
            transform: none !important;
            will-change: auto !important;
        }
        
        /* Optimize paint operations */
        body.is-mobile .nav-item, 
        body.is-mobile .feature-item,
        body.is-mobile .testimonial-item,
        body.is-mobile header h1,
        body.is-mobile .cta-button {
            -webkit-font-smoothing: antialiased;
            backface-visibility: hidden;
            transform: translateZ(0);
        }
        
        /* Handle reduced motion preference */
        body.reduced-motion * {
            transition-duration: 0.1s !important;
            animation: none !important;
        }
        
        /* Make sure scrolling is optimized */
        body.is-mobile .overlay {
            -webkit-overflow-scrolling: touch;
        }
        
        /* Optimize images for mobile */
        body.is-mobile img:not([loading="lazy"]) {
            content-visibility: auto;
        }
        
        /* Improve tap target sizes for mobile */
        body.is-mobile a, 
        body.is-mobile button {
            min-height: 44px;
            min-width: 44px;
        }
    </style>
    `);
    
    // Add touch-specific event handling for mobile
    if (isMobile) {
        // Add debounced scroll optimization
        let lastScrollPosition = window.scrollY;
        let scrollTimeout;
        
        window.addEventListener('scroll', function() {
            // Skip animations during scroll
            if (lastScrollPosition !== window.scrollY) {
                document.body.classList.add('is-scrolling');
                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(function() {
                    document.body.classList.remove('is-scrolling');
                    lastScrollPosition = window.scrollY;
                }, 100);
            }
        }, { passive: true });
        
        // Add extra style for scrolling state
        document.head.insertAdjacentHTML('beforeend', `
        <style>
            /* Disable animations during scroll for performance */
            body.is-mobile.is-scrolling * {
                animation-play-state: paused !important;
                transition: none !important;
            }
        </style>
        `);
        
        // Prioritize visible content
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img:not([loading="lazy"])');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.style.visibility = 'visible';
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => {
                if (!img.complete) {
                    img.style.visibility = 'hidden';
                    observer.observe(img);
                }
            });
        }
    }
} 