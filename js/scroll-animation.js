// Scroll Animation Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize ScrollReveal for element animations on scroll
    initScrollAnimations();
    
    // Initialize progress bar
    initProgressBar();
    
    // Initialize scroll event listeners
    addScrollListeners();
    
    // Setup scroll-triggered animations for elements with the 'reveal' class
    setupScrollRevealElements();

    // Special handling for tournament guide FAQ sections
    if (document.querySelector('.qa-list')) {
        setupFAQCompatibility();
    }
});

// Initialize scroll-based animations
function initScrollAnimations() {
    // Add scroll event listener for performance
    window.addEventListener('scroll', throttle(function() {
        // Update animations based on scroll position
        animateOnScroll();
        
        // Update the navigation bar
        updateNavbar();
        
        // Show/hide the back to top button
        toggleBackToTop();
    }, 100)); // Throttle to improve performance
}

// Initialize progress bar at the top of the page
function initProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', throttle(function() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            // Update the progress bar width
            progressBar.style.width = scrolled + '%';
        }, 10)); // Use a smaller throttle for smoother progress bar
    }
}

// Add scroll event listeners
function addScrollListeners() {
    // For section-specific animations
    window.addEventListener('scroll', debounce(function() {
        // Check for sections entering viewport
        const sections = document.querySelectorAll('section, .home-description, .features, .testimonials');
        sections.forEach(section => {
            if (isElementInViewport(section) && !section.classList.contains('animated')) {
                section.classList.add('animated');
                animateSection(section);
            }
        });
    }, 50));
}

// Setup reveal animations for elements with the 'reveal' class
function setupScrollRevealElements() {
    // Get all elements with the reveal class
    const revealElements = document.querySelectorAll('.reveal:not(.active)');
    
    // Initial check for elements in viewport
    revealElements.forEach(el => {
        if (isElementInViewport(el)) {
            el.classList.add('active');
        }
    });
    
    // Add scroll listener for reveal elements
    window.addEventListener('scroll', throttle(function() {
        revealElements.forEach(el => {
            if (isElementInViewport(el) && !el.classList.contains('active')) {
                el.classList.add('active');
            }
        });
    }, 100));
}

// Special handling for tournament guide FAQ sections
function setupFAQCompatibility() {
    // Make sure FAQ items can still be clicked when animated
    const qaItems = document.querySelectorAll('.qa-item');
    
    // Initialize global state tracking if it doesn't exist yet
    if (!window.qaItemStates) {
        window.qaItemStates = new Map();
    }
    
    qaItems.forEach(item => {
        // Initialize state if needed
        if (!window.qaItemStates.has(item)) {
            window.qaItemStates.set(item, item.classList.contains('active'));
        }
        
        // Ensure any animation doesn't interfere with click handling
        item.style.pointerEvents = 'auto';
        
        // Track changes to active state from click events
        const question = item.querySelector('.question');
        if (question) {
            question.addEventListener('click', function() {
                // Update tracking after state toggle
                setTimeout(() => {
                    window.qaItemStates.set(item, item.classList.contains('active'));
                }, 50);
            });
        }
        
        // Observe class changes to handle animation conflicts
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    // Get the current expected state
                    const shouldBeActive = window.qaItemStates.get(item);
                    const isActive = item.classList.contains('active');
                    
                    // Only apply changes if the state doesn't match what we expect
                    if (shouldBeActive !== isActive) {
                        if (shouldBeActive) {
                            // Should be active but isn't
                            item.classList.add('active');
                            const answer = item.querySelector('.answer');
                            if (answer) {
                                answer.style.maxHeight = '500px';
                                answer.style.opacity = '1';
                                answer.style.padding = '20px';
                            }
                        } else {
                            // Should be inactive but is active
                            item.classList.remove('active');
                            const answer = item.querySelector('.answer');
                            if (answer) {
                                answer.style.maxHeight = '0';
                                answer.style.opacity = '0';
                                answer.style.padding = '0 20px';
                            }
                        }
                    }
                }
            });
        });
        
        observer.observe(item, { attributes: true });
    });
    
    // Also listen for scroll events to maintain state
    window.addEventListener('scroll', throttle(function() {
        qaItems.forEach(item => {
            const shouldBeActive = window.qaItemStates.get(item);
            const isActive = item.classList.contains('active');
            
            if (shouldBeActive !== isActive) {
                if (shouldBeActive) {
                    item.classList.add('active');
                    const answer = item.querySelector('.answer');
                    if (answer) {
                        answer.style.maxHeight = '500px';
                        answer.style.opacity = '1';
                        answer.style.padding = '20px';
                    }
                } else {
                    item.classList.remove('active');
                    const answer = item.querySelector('.answer');
                    if (answer) {
                        answer.style.maxHeight = '0';
                        answer.style.opacity = '0';
                        answer.style.padding = '0 20px';
                    }
                }
            }
        });
    }, 50));
}

// Animate elements based on scroll position
function animateOnScroll() {
    // Parallax effect for background elements
    const videoBackground = document.querySelector('.video-bg');
    if (videoBackground) {
        const scrollPosition = window.pageYOffset;
        videoBackground.style.transform = `translateY(${scrollPosition * 0.3}px)`;
    }
    
    // Animate features section
    const features = document.querySelector('.features');
    if (features && isElementInViewport(features) && !features.classList.contains('animated')) {
        features.classList.add('animated');
        const featureItems = features.querySelectorAll('.feature-item');
        featureItems.forEach((item, index) => {
            item.style.transitionDelay = `${0.2 * index}s`;
            item.classList.add('fade-in-up');
        });
    }
    
    // Animate testimonials section
    const testimonials = document.querySelector('.testimonials');
    if (testimonials && isElementInViewport(testimonials) && !testimonials.classList.contains('animated')) {
        testimonials.classList.add('animated');
        const testimonialItems = testimonials.querySelectorAll('.testimonial-item');
        testimonialItems.forEach((item, index) => {
            item.style.transitionDelay = `${0.2 * index}s`;
            item.classList.add('fade-in-up');
        });
    }
}

// Animate a specific section with custom animations
function animateSection(section) {
    // Different animations based on section class/id
    if (section.classList.contains('home-description')) {
        const elements = section.querySelectorAll('h2, p, .feature-item, .cta-section');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fade-in-up');
            }, 200 * index);
        });
    } else if (section.classList.contains('features')) {
        const featureItems = section.querySelectorAll('.feature-item');
        featureItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('fade-in-up');
            }, 200 * index);
        });
    } else if (section.classList.contains('testimonials')) {
        const items = section.querySelectorAll('.testimonial-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('fade-in-up');
            }, 200 * index);
        });
    }
}

// Update the navigation bar based on scroll position
function updateNavbar() {
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        if (window.scrollY > 50) {
            topBar.classList.add('scrolled');
        } else {
            topBar.classList.remove('scrolled');
        }
    }
}

// Toggle back to top button visibility
function toggleBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.left >= 0 &&
        rect.bottom >= 0 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Throttle function to limit how often a function is called
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function to delay execution until after a pause
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Add scroll-triggered animation classes to CSS
document.head.insertAdjacentHTML('beforeend', `
<style>
    /* Scroll animation styles */
    .scroll-fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .scroll-fade-in.active {
        opacity: 1;
        transform: translateY(0);
    }
    
    .scroll-fade-left {
        opacity: 0;
        transform: translateX(-50px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .scroll-fade-left.active {
        opacity: 1;
        transform: translateX(0);
    }
    
    .scroll-fade-right {
        opacity: 0;
        transform: translateX(50px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .scroll-fade-right.active {
        opacity: 1;
        transform: translateX(0);
    }
    
    .scroll-zoom-in {
        opacity: 0;
        transform: scale(0.8);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .scroll-zoom-in.active {
        opacity: 1;
        transform: scale(1);
    }
    
    .scroll-rotate {
        opacity: 0;
        transform: rotate(-10deg) scale(0.9);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .scroll-rotate.active {
        opacity: 1;
        transform: rotate(0) scale(1);
    }
    
    /* Staggered animation delays for children */
    .stagger-children > *:nth-child(1) { transition-delay: 0.1s; }
    .stagger-children > *:nth-child(2) { transition-delay: 0.2s; }
    .stagger-children > *:nth-child(3) { transition-delay: 0.3s; }
    .stagger-children > *:nth-child(4) { transition-delay: 0.4s; }
    .stagger-children > *:nth-child(5) { transition-delay: 0.5s; }
    .stagger-children > *:nth-child(6) { transition-delay: 0.6s; }
    
    /* Ensure scroll animations don't break FAQ functionality */
    .qa-item {
        pointer-events: auto !important;
    }
</style>
`); 