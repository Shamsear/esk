// Warm up page cache for faster navigation
function warmPageCache() {
    // Common pages that might be navigated to
    const commonPages = ['index.html', 'career-mode.html'];
    
    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            commonPages.forEach(page => {
                if (!window.location.href.includes(page)) {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = page;
                    document.head.appendChild(link);
                }
            });
        }, { timeout: 2000 });
    } else {
        // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
        commonPages.forEach(page => {
            if (!window.location.href.includes(page)) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = page;
                document.head.appendChild(link);
            }
        });
        }, 2000);
    }
}

// Initialize page - optimized for speed
function initPage() {
    document.body.style.filter = 'none';
    document.body.style.opacity = '1';
    
    // Smooth page transition
    const pageTransition = document.querySelector('.page-transition');
    if (pageTransition) {
        pageTransition.style.transform = 'translateX(-100%)';
    }
    
    // Enable interactions
    document.body.style.pointerEvents = 'auto';
    
    // Enhanced animations
    requestAnimationFrame(() => {
        animateElementsOnLoad();
        initSectionAnimations();
        enhanceNavigationCards();
    });
}

// Animate elements on page load - optimized for speed
function animateElementsOnLoad() {
    // Animate header elements with simple animation
    const header = document.querySelector('header');
    if (header) {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
    }
    
    // Create staggered animation for nav items - with reduced complexity
    const navItems = document.querySelectorAll('.nav-item');
    
    // Use batch processing for better performance
    const batchSize = 5;
    for (let i = 0; i < navItems.length; i += batchSize) {
        const endIndex = Math.min(i + batchSize, navItems.length);
        
        setTimeout(() => {
            for (let j = i; j < endIndex; j++) {
                const item = navItems[j];
            item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }
        }, i * 10); // Reduced delay between batches
    }

    // Add animation only to visible sections - using Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated-section');
                    // Stop observing after animation is added
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('section:not(.animated-section), .career-description:not(.animated-section)').forEach(section => {
            sectionObserver.observe(section);
        });
    } else {
        // Fallback for older browsers
        document.querySelectorAll('section:not(.animated-section), .career-description:not(.animated-section)').forEach(section => {
        if (isElementInViewport(section)) {
            section.classList.add('animated-section');
        }
    });
    }
    
    // Use Intersection Observer for reveal animations
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing after animation is added
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            revealObserver.observe(el);
        });
    }
}

// Handle browser back/forward navigation
window.addEventListener('pageshow', function(event) {
    // Check if the page is being shown from the browser cache (back/forward navigation)
    if (event.persisted) {
        // This is a back/forward navigation - instant initialization
        document.body.style.animation = 'none'; // Skip the entry animation
        initPage();
    }
});

// Preloader with optimized timing
window.addEventListener('load', function() {
    // Initialize page
    initPage();
    
    // Start warming the cache for other pages
    warmPageCache();
    
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        // Reduce preloader time
    setTimeout(function() {
        preloader.classList.add('fade-out');
        
            // Lazy load images for better performance
            lazyLoadImages();
            
            // Show welcome toast - reduced delay
        setTimeout(function() {
            const toast = document.getElementById('toast');
            if (toast) {
                toast.classList.add('show');
                
                setTimeout(function() {
                    toast.classList.remove('show');
                    }, 2000); // Reduced toast display time
                }
            }, 500); // Reduced delay before showing toast
            
        }, 500); // Reduced preloader time
    }
    
    // Initialize audio with reduced startup impact
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => initAudio());
    } else {
        setTimeout(initAudio, 2000);
    }
});

// Initialize audio separately to reduce initial load impact
function initAudio() {
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic) {
        backgroundMusic.volume = 0.3;
        backgroundMusic.muted = true;
    }
}

// Lazy load images for better performance
function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.setAttribute('src', src);
                        img.removeAttribute('data-src');
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers - load all images with a delay
        setTimeout(() => {
            document.querySelectorAll('img[data-src]').forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.setAttribute('src', src);
                    img.removeAttribute('data-src');
                }
            });
        }, 1000);
    }
}

// Add scroll effects function
function handleScrollEffects() {
    const scrollPosition = window.scrollY;
    const header = document.querySelector('header');
    
    // Add header scroll effect
    if (header) {
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        progressBar.style.width = progress + '%';
    }
}

function updateActiveSections() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 60) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
}

// Optimize scroll handlers with throttling
function throttle(callback, limit) {
    let waiting = false;
    return function() {
        if (!waiting) {
            callback.apply(this, arguments);
            waiting = true;
            setTimeout(() => {
                waiting = false;
            }, limit);
        }
    };
}

// Use throttled scroll handler for performance
const throttledScrollHandler = throttle(function() {
    // Handle scroll effects
    handleScrollEffects();
    
    // Update progress bar
    updateProgressBar();
    
    // Update active section in navigation
    updateActiveSections();
}, 100); // Run max 10 times per second

window.addEventListener('scroll', throttledScrollHandler);

// Typing effect
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-effect');
    if (typingElement) {
        const text = typingElement.textContent;
        typingElement.textContent = '';
        typingElement.style.opacity = '1';
        
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                typingElement.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                typingElement.classList.remove('typing-effect');
            }
        }, 100);
    }
}

// Custom cursor
document.addEventListener('DOMContentLoaded', function() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        document.addEventListener('mousemove', function(e) {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            
            // Delay outline cursor for effect
            setTimeout(() => {
                cursorOutline.style.left = e.clientX + 'px';
                cursorOutline.style.top = e.clientY + 'px';
            }, 50);
        });
        
        // Cursor effect on links and buttons
        document.querySelectorAll('a, button, .nav-item, .back-to-top').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorOutline.style.borderColor = 'var(--secondary)';
                cursorDot.style.backgroundColor = 'var(--secondary)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.borderColor = 'var(--primary)';
                cursorDot.style.backgroundColor = 'var(--primary)';
            });
        });
    }
    
    // Page transition for links
    document.querySelectorAll('a[href]:not([href^="#"])').forEach(link => {
        // Prefetch the linked page when hovering over the link
        link.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            if (this.hostname === window.location.hostname && !this._prefetched) {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = href;
                document.head.appendChild(prefetchLink);
                this._prefetched = true;
            }
        });
        
        link.addEventListener('click', function(e) {
            if (this.hostname === window.location.hostname) {
                e.preventDefault();
                const pageTransition = document.querySelector('.page-transition');
                const href = this.getAttribute('href');
                
                // Create ripple effect from click point with faster animation
                const ripple = document.createElement('div');
                ripple.className = 'ripple-effect fast';
                
                // Position the ripple at click position
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                link.appendChild(ripple);
                
                // Disable pointer events during transition
                document.body.style.pointerEvents = 'none';
                
                // Smoother fade without blur for better performance
                document.body.style.opacity = '0.95';
                document.body.style.transition = 'opacity 0.2s cubic-bezier(0.19, 1, 0.22, 1)';
                
                // Show transition with minimal delay
                setTimeout(() => {
                    pageTransition.classList.add('active');
                    
                    // Navigate after shorter transition
                    setTimeout(() => {
                        window.location.href = href;
                    }, 400); // Shorter transition time for quicker navigation
                }, 100);
            }
        });
    });
    
    // Scroll indicators
    const scrollIndicators = document.querySelectorAll('.scroll-indicator');
    if (scrollIndicators.length) {
        const sections = ['home', 'history', 'players', 'championship', 'gallery'];
        
        window.addEventListener('scroll', function() {
            // Calculate which section is in view
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            let activeSection = 0;
            
            sections.forEach((section, index) => {
                const sectionElement = document.getElementById(section);
                if (sectionElement) {
                    const sectionTop = sectionElement.offsetTop;
                    const sectionHeight = sectionElement.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        activeSection = index;
                    }
                }
            });
            
            // Update active indicator
            scrollIndicators.forEach((indicator, index) => {
                if (index === activeSection) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        });
        
        // Click on indicators to scroll to section
        scrollIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function() {
                const sectionId = this.dataset.section;
                const sectionElement = document.getElementById(sectionId);
                
                if (sectionElement) {
                    sectionElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Progress bar
    window.addEventListener('scroll', function() {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    });
    
    // Function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
        );
    }
    
    // Reveal elements on scroll
    window.addEventListener('scroll', function() {
        const reveals = document.querySelectorAll('.reveal:not(.active)');
        reveals.forEach(el => {
            if (isElementInViewport(el)) {
                el.classList.add('active');
            }
        });
    });
    
    // 3D Tilt effect for cards
    const tiltElements = document.querySelectorAll('.tilt-effect');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', function(e) {
            const card = this.querySelector('.nav-card');
            if (!card) return;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(10px)`;
        });
        
        el.addEventListener('mouseleave', function() {
            const card = this.querySelector('.nav-card');
            if (!card) return;
            card.style.transform = '';
        });
    });
    
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    if (menuToggle && mobileMenu && closeMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Particles.js initialization
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.3,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
    
    // Shrink navbar on scroll
    window.addEventListener('scroll', function() {
        const topBar = document.querySelector('.top-bar');
        
        if (window.scrollY > 50) {
            topBar.classList.add('scrolled');
        } else {
            topBar.classList.remove('scrolled');
        }
    });
    
    // Add hover sound effect for navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const hoverSound = new Audio();
            hoverSound.volume = 0.2;
            hoverSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbsAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MUZAAAAAGkAAAAAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MUZAMAAAGkAAAAAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MUZAYAAAGkAAAAAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MUZAkAAAGkAAAAAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
            hoverSound.play().catch(e => console.log('Audio play failed:', e));
        });
    });
    
    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });
});

// Function to check if element is in viewport - needs to be global for the load event
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
    );
} 

// Add event listener to clear any lingering blur effects when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Clear any lingering blur or opacity effects
    document.body.style.filter = 'none';
    document.body.style.opacity = '1';
    document.body.style.transition = '';
    
    // Ensure page transition element is reset
    const pageTransition = document.querySelector('.page-transition');
    if (pageTransition) {
        pageTransition.classList.remove('active');
    }
});

// Add scroll event listener
document.addEventListener('DOMContentLoaded', () => {
    // Initial call
    handleScrollEffects();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScrollEffects);
});

// Enhanced section animations
function initSectionAnimations() {
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Enhanced navigation cards
function enhanceNavigationCards() {
    const cards = document.querySelectorAll('.nav-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(1.05, 1.05, 1.05)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Enhanced particle effects
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#ffffff' },
                shape: { type: 'circle' },
                opacity: {
                    value: 0.5,
                    random: true,
                    animation: { enable: true, speed: 1, minimumValue: 0.1 }
                },
                size: {
                    value: 3,
                    random: true,
                    animation: { enable: true, speed: 2, minimumValue: 0.1 }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    outMode: 'out',
                    bounce: false,
                    attract: { enable: false, rotateX: 600, rotateY: 1200 }
                }
            },
            interactivity: {
                detectOn: 'canvas',
                events: {
                    onHover: { enable: true, mode: 'grab' },
                    onClick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, lineLinked: { opacity: 1 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }
}

// Initialize enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPage();
    initParticles();
    
    // Enhance scroll animations
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.reveal').forEach(el => {
        scrollObserver.observe(el);
    });
    
    // Enhanced hover effects for feature items
    document.querySelectorAll('.feature-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-15px) scale(1.02)';
            item.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.5)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
            item.style.boxShadow = '';
        });
    });
});

// Enhanced page transitions
window.addEventListener('beforeunload', () => {
    document.body.classList.add('page-exit');
}); 