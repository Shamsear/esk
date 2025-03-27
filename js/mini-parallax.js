// Mini Parallax Script - Optimized for mobile
document.addEventListener('DOMContentLoaded', function() {
    // Initialize parallax effects with performance optimizations
    initParallaxEffects();
    
    // Window resize handler with debounce
    window.addEventListener('resize', debounce(function() {
        // Reinitialize on resize to adjust for device type
        initParallaxEffects();
    }, 200)); // Increased debounce for better performance
});

// Initialize parallax effects
function initParallaxEffects() {
    // Detect device capability
    const isMobile = window.innerWidth < 768;
    const isLowPowerDevice = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    
    // Completely disable parallax effects on lower-powered devices and mobile
    if (isLowPowerDevice) {
        disableParallaxEffectsForMobile();
        return;
    }
    
    // Add optimized parallax effect to video background
    const videoBg = document.querySelector('.video-bg');
    if (videoBg) {
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrollPosition = window.pageYOffset;
                    videoBg.style.transform = `translateY(${scrollPosition * 0.3}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    // Add optimized parallax effect to header elements
    const headerElements = document.querySelectorAll('header h1, header .subtitle, header .cta-button');
    headerElements.forEach((el, index) => {
        const speed = 0.05 * (index + 1);
        
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrollPosition = window.pageYOffset;
                    el.style.transform = `translateY(${-scrollPosition * speed}px) translateZ(0)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    });
    
    // Add optimized parallax effect to navigation items - subtle float effect
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((el, index) => {
        const speed = 0.02 + (index * 0.005); // Reduced multiplier for smoother effect
        
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrollPosition = window.pageYOffset;
                    el.style.transform = `translateY(${-scrollPosition * speed}px) translateZ(0)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    });
    
    // Subtle rotation parallax effect on features items - using requestAnimationFrame
    const featureItems = document.querySelectorAll('.feature-item i');
    featureItems.forEach((el, index) => {
        const speed = 0.01 * (index + 1); // Reduced from 0.02 to 0.01 for smoother effect
        
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrollPosition = window.pageYOffset;
                    el.style.transform = `rotate(${scrollPosition * speed}deg) translateZ(0)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    });
    
    // Parallax for testimonials - using Intersection Observer for better performance
    setupTestimonialParallax();
    
    // Initialize mouse parallax effect for the logo - but only on desktop
    if (!isMobile) {
        initMouseParallax();
    }
}

// Set up testimonial parallax using Intersection Observer
function setupTestimonialParallax() {
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    
    if ('IntersectionObserver' in window) {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const index = Array.from(testimonialItems).indexOf(el);
                    const direction = index % 2 === 0 ? 1 : -1;
                    const ratio = Math.min(entry.intersectionRatio * 1.5, 1);
                    const offset = 50 * direction * (1 - ratio);
                    
                    requestAnimationFrame(() => {
                        el.style.transform = `translateX(${offset}px) translateZ(0)`;
                        el.style.opacity = ratio;
                    });
                }
            });
        }, options);
        
        testimonialItems.forEach(item => observer.observe(item));
    } else {
        // Fallback for browsers without Intersection Observer
        testimonialItems.forEach((el, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            const speed = 0.08;
            
            let ticking = false;
            window.addEventListener('scroll', function() {
                if (!ticking) {
                    requestAnimationFrame(function() {
                        const rect = el.getBoundingClientRect();
                        const scrollDistance = window.innerHeight - rect.top;
                        
                        if (scrollDistance > 0 && rect.top > 0) {
                            const offset = Math.min(scrollDistance * speed * direction, 50 * direction);
                            el.style.transform = `translateX(${offset}px) translateZ(0)`;
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        });
    }
}

// Initialize mouse parallax effect for the logo
function initMouseParallax() {
    const logo = document.querySelector('.logo');
    
    if (logo && window.innerWidth >= 768) {
        // Use passive event listener for better performance
        document.addEventListener('mousemove', function(e) {
            requestAnimationFrame(() => {
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                const moveX = (mouseX - (windowWidth / 2)) * 0.01;
                const moveY = (mouseY - (windowHeight / 2)) * 0.01;
                
                logo.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1)`;
            });
        }, { passive: true });
        
        // Reset transform when mouse leaves the window
        document.addEventListener('mouseleave', function() {
            requestAnimationFrame(() => {
                logo.style.transform = 'translate3d(0, 0, 0) scale(1)';
            });
        }, { passive: true });
    }
}

// Disable parallax effects for mobile
function disableParallaxEffectsForMobile() {
    // Reset all parallax transformations
    const parallaxElements = document.querySelectorAll('.video-bg, header h1, header .subtitle, header .cta-button, .nav-item, .feature-item i, .testimonial-item, .logo');
    
    parallaxElements.forEach(el => {
        el.style.transform = '';
        
        // Remove event listeners by cloning elements
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
    });
    
    // Add simplified animations for mobile
    document.head.insertAdjacentHTML('beforeend', `
    <style>
        @media (max-width: 768px) {
            /* Simplified animations for mobile */
            .testimonial-item {
                transition: opacity 0.5s ease, transform 0.5s ease;
                transform: translateZ(0);
            }
            
            .testimonial-item:nth-child(odd) {
                transform: translateX(15px) translateZ(0);
            }
            
            .testimonial-item:nth-child(even) {
                transform: translateX(-15px) translateZ(0);
            }
            
            .testimonial-item.active {
                transform: translateX(0) translateZ(0);
            }
            
            /* Use simpler animation for features */
            .feature-item i {
                transition: transform 0.5s ease;
            }
            
            .feature-item:hover i {
                transform: rotate(10deg) scale(1.1) translateZ(0);
            }
        }
    </style>
    `);
}

// Improved debounce function with timestamp checking
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 