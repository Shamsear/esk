// Warm up page cache for faster navigation
function warmPageCache() {
    // Common pages that might be navigated to
    const commonPages = ['index.html', 'career-mode.html'];
    
    // Preload these pages in the background
    setTimeout(() => {
        commonPages.forEach(page => {
            if (!window.location.href.includes(page)) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = page;
                document.head.appendChild(link);
                console.log('Prefetched:', page);
            }
        });
    }, 2000); // Wait for the current page to finish loading first
}

// Helper function to check if an element is visible in viewport
function isElementInViewport(el) {
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Initialize page - optimized for speed
function initPage() {
    // Handle the fade-in of the page
    if (document.querySelector('.page-transition')) {
        document.querySelector('.page-transition').style.transform = 'translateX(-100%)';
    }
    
    // Enable interactions immediately
    document.body.style.pointerEvents = 'auto';
    
    // Reset any transition effects
    document.body.style.opacity = '1';
    document.body.style.filter = 'blur(0)';
    
    // Add smooth entrance animations to elements - using requestAnimationFrame for better performance
    requestAnimationFrame(() => animateElementsOnLoad());
}

// Animate elements on page load - optimized for speed
function animateElementsOnLoad() {
    // Animate header elements with a water-like effect
    const header = document.querySelector('header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-15px)';
        
        requestAnimationFrame(() => {
            header.style.transition = 'opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1), transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        });
    }
    
    // Create staggered wave-like animation for nav items - with performance optimizations
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px) scale(0.95)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1), transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
        }, 100 + (index * 50)); // Shorter delay between items
    });

    // Add liquid animation to sections - limit to visible sections only
    const sections = document.querySelectorAll('section:not(.animated-section), .career-description:not(.animated-section)');
    sections.forEach((section) => {
        if (isElementInViewport(section)) {
            section.classList.add('animated-section');
        }
    });
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

// Preloader
window.addEventListener('load', function() {
    // Initialize page
    initPage();
    
    // Start warming the cache for other pages
    warmPageCache();
    
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(function() {
            preloader.classList.add('fade-out');
            
            // Initialize navigation items with skeleton loading effect
            const navCards = document.querySelectorAll('.nav-card');
            navCards.forEach(card => {
                const img = card.querySelector('img');
                if (img) {
                    card.classList.add('skeleton');
                    img.onload = function() {
                        card.classList.remove('skeleton');
                    };
                    // Fix for image loading issues
                    if (img.complete) {
                        card.classList.remove('skeleton');
                    }
                }
            });
            
            // Show welcome toast
            setTimeout(function() {
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.classList.add('show');
                    
                    setTimeout(function() {
                        toast.classList.remove('show');
                    }, 3000);
                }
            }, 1500);
            
        }, 1000);
    }
    
    // Initialize audio
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic) {
        backgroundMusic.volume = 0.3; // Set initial volume
        // Mute by default
        backgroundMusic.muted = true;
    }
    
    // Add audio toggle if not present
    const audioToggle = document.querySelector('.audio-toggle');
    if (!audioToggle) {
        const audioBtn = document.createElement('div');
        audioBtn.className = 'audio-toggle';
        audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        audioBtn.setAttribute('aria-label', 'Toggle audio');
        document.body.appendChild(audioBtn);
        
        audioBtn.addEventListener('click', function() {
            if (backgroundMusic) {
                backgroundMusic.muted = !backgroundMusic.muted;
                
                if (backgroundMusic.muted) {
                    this.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    this.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            }
        });
    }
    
    // Activate all reveal elements initially visible
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        if (isElementInViewport(el)) {
            el.classList.add('active');
        }
    });
    
    // Initialize typing effect
    initTypingEffect();

    // Initialize back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

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
        link.addEventListener('click', function(e) {
            if (this.hostname === window.location.hostname) {
                e.preventDefault();
                const pageTransition = document.querySelector('.page-transition');
                
                pageTransition.classList.add('active');
                
                setTimeout(() => {
                    window.location = this.href;
                }, 500);
            }
        });
    });
    
    // Progress bar
    window.addEventListener('scroll', function() {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    });
    
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
    
    // Particles.js initialization - with error handling
    if (typeof particlesJS !== 'undefined') {
        try {
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
                        }
                    },
                    "opacity": {
                        "value": 0.5,
                        "random": false
                    },
                    "size": {
                        "value": 3,
                        "random": true
                    },
                    "line_linked": {
                        "enable": true,
                        "distance": 150,
                        "color": "#ffffff",
                        "opacity": 0.4,
                        "width": 1
                    },
                    "move": {
                        "enable": true,
                        "speed": 2,
                        "direction": "none",
                        "random": false,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false
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
                    }
                }
            });
        } catch (e) {
            console.warn('ParticlesJS initialization failed:', e);
        }
    }
}); 