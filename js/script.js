// Warm up page cache for faster navigation
function warmPageCache() {
    // Common pages that might be navigated to
    const commonPages = ['index.html', 'career-mode.html'];
    
<<<<<<< HEAD
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
=======
    // Preload these pages in the background
>>>>>>> parent of 4cc0256 (perf)
    setTimeout(() => {
        commonPages.forEach(page => {
            if (!window.location.href.includes(page)) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = page;
                document.head.appendChild(link);
<<<<<<< HEAD
            }
        });
        }, 2000);
    }
=======
                console.log('Prefetched:', page);
            }
        });
    }, 2000); // Wait for the current page to finish loading first
>>>>>>> parent of 4cc0256 (perf)
}

// Initialize page - optimized for speed
function initPage() {
    // Reset any transition effects that might be lingering
    document.body.style.filter = 'none';
    document.body.style.opacity = '1';
    
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
<<<<<<< HEAD
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
=======
        header.style.opacity = '0';
        header.style.transform = 'translateY(-15px)';
        
        requestAnimationFrame(() => {
            header.style.transition = 'opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1), transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        });
>>>>>>> parent of 4cc0256 (perf)
    }
    
    // Create staggered wave-like animation for nav items - with performance optimizations
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px) scale(0.95)';
        
        setTimeout(() => {
<<<<<<< HEAD
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
=======
            item.style.transition = 'opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1), transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0) scale(1)';
        }, 100 + (index * 50)); // Shorter delay between items
    });

    // Add liquid animation to sections - limit to visible sections only
    const sections = document.querySelectorAll('section:not(.animated-section), .career-description:not(.animated-section)');
    sections.forEach((section) => {
>>>>>>> parent of 4cc0256 (perf)
        if (isElementInViewport(section)) {
            section.classList.add('animated-section');
        }
    });
<<<<<<< HEAD
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
=======
>>>>>>> parent of 4cc0256 (perf)
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
<<<<<<< HEAD
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
=======
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
>>>>>>> parent of 4cc0256 (perf)
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
    
    // Initialize audio
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic) {
        backgroundMusic.volume = 0.3; // Set initial volume
        // Mute by default
        backgroundMusic.muted = true;
    }
<<<<<<< HEAD
}
=======
    
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
        
        // Style the audio toggle button
        audioBtn.style.position = 'fixed';
        audioBtn.style.bottom = '30px';
        audioBtn.style.left = '30px';
        audioBtn.style.width = '50px';
        audioBtn.style.height = '50px';
        audioBtn.style.borderRadius = '50%';
        audioBtn.style.background = 'linear-gradient(45deg, var(--primary), var(--secondary))';
        audioBtn.style.color = 'white';
        audioBtn.style.display = 'flex';
        audioBtn.style.justifyContent = 'center';
        audioBtn.style.alignItems = 'center';
        audioBtn.style.zIndex = '99';
        audioBtn.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        audioBtn.style.cursor = 'pointer';
        audioBtn.style.transition = 'all 0.3s ease';
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
>>>>>>> parent of 4cc0256 (perf)

    // Initialize back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
<<<<<<< HEAD
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
=======
});
>>>>>>> parent of 4cc0256 (perf)

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