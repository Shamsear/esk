// Mini Parallax Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize parallax effects
    initParallaxEffects();
    
    // Window resize handler
    window.addEventListener('resize', debounce(function() {
        initParallaxEffects();
    }, 100));
});

// Initialize parallax effects
function initParallaxEffects() {
    // Only initialize parallax on desktop - it can be resource intensive on mobile
    if (window.innerWidth < 768) {
        return;
    }
    
    // Add parallax effect to video background
    const videoBg = document.querySelector('.video-bg');
    if (videoBg) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            videoBg.style.transform = `translateY(${scrollPosition * 0.3}px)`;
        });
    }
    
    // Add parallax effect to header elements
    const headerElements = document.querySelectorAll('header h1, header .subtitle, header .cta-button');
    headerElements.forEach((el, index) => {
        const speed = 0.05 * (index + 1);
        
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            el.style.transform = `translateY(${-scrollPosition * speed}px)`;
        });
    });
    
    // Add parallax effect to navigation items - subtle float effect
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((el, index) => {
        const speed = 0.02 + (index * 0.01);
        
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            el.style.transform = `translateY(${-scrollPosition * speed}px)`;
        });
    });
    
    // Subtle rotation parallax effect on features items
    const featureItems = document.querySelectorAll('.feature-item i');
    featureItems.forEach((el, index) => {
        const speed = 0.02 * (index + 1);
        
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            el.style.transform = `rotate(${scrollPosition * speed}deg)`;
        });
    });
    
    // Parallax for testimonials - slide in from sides
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    testimonialItems.forEach((el, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const speed = 0.08;
        
        window.addEventListener('scroll', function() {
            const rect = el.getBoundingClientRect();
            const scrollDistance = window.innerHeight - rect.top;
            
            if (scrollDistance > 0 && rect.top > 0) {
                const offset = Math.min(scrollDistance * speed * direction, 50 * direction);
                el.style.transform = `translateX(${offset}px)`;
            }
        });
    });
    
    // Initialize mouse parallax effect for the logo
    initMouseParallax();
}

// Initialize mouse parallax effect
function initMouseParallax() {
    const logo = document.querySelector('.logo');
    
    if (logo && window.innerWidth >= 768) {
        document.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            const moveX = (mouseX - (windowWidth / 2)) * 0.01;
            const moveY = (mouseY - (windowHeight / 2)) * 0.01;
            
            logo.style.transform = `translate(${moveX}px, ${moveY}px) scale(1)`;
        });
        
        // Reset transform when mouse leaves the window
        document.addEventListener('mouseleave', function() {
            logo.style.transform = 'translate(0, 0) scale(1)';
        });
    }
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
} 