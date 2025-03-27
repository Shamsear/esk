/**
 * Tournament Guide Accordion and Interactive Features
 */

// IMMEDIATE FIX: Apply visibility to Q&A elements as soon as possible
(function() {
    // Create and append emergency style tag that doesn't depend on DOMContentLoaded
    const emergencyStyle = document.createElement('style');
    emergencyStyle.textContent = `
        .qa-list, .qa-item, .question {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            max-height: none !important;
        }
        .question {
            pointer-events: auto !important;
            cursor: pointer !important;
            position: relative !important;
            z-index: 10 !important;
            background: rgba(20, 20, 30, 0.4) !important;
            color: #fff !important;
            border-left: 3px solid #3498db !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
            backdrop-filter: blur(5px) !important;
            -webkit-backdrop-filter: blur(5px) !important;
        }
        .qa-item.active .question {
            border-left-color: #e74c3c !important;
            background: rgba(30, 30, 40, 0.6) !important;
        }
        .qa-item.active .answer {
            background: rgba(15, 15, 25, 0.3) !important;
            color: rgba(255, 255, 255, 0.9) !important;
            border-left: 3px solid #e74c3c !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
            backdrop-filter: blur(5px) !important;
            -webkit-backdrop-filter: blur(5px) !important;
        }
        .answer .highlight {
            color: #e74c3c !important;
            font-weight: 600 !important;
        }
    `;
    document.head.appendChild(emergencyStyle);
    
    // Try to immediately reveal Q&A elements
    const revealQA = function() {
        const qaElements = document.querySelectorAll('.qa-list, .qa-item, .question');
        if (qaElements.length > 0) {
            qaElements.forEach(el => {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
            });
            
            // Fix answer styling
            const answers = document.querySelectorAll('.answer');
            answers.forEach(answer => {
                answer.style.color = 'rgba(255, 255, 255, 0.9)';
                answer.style.background = 'rgba(15, 15, 25, 0.3)';
                
                // Style highlights inside answers
                const highlights = answer.querySelectorAll('.highlight');
                highlights.forEach(highlight => {
                    highlight.style.color = '#e74c3c';
                    highlight.style.fontWeight = '600';
                });
            });
            
            console.log('IMMEDIATE QA visibility fix applied!');
        } else {
            // If elements aren't found yet, try again in a moment
            setTimeout(revealQA, 50);
        }
    };
    
    // Try immediately
    revealQA();
    
    // Also try when more DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', revealQA);
    } else {
        revealQA(); // DOM already loaded, run now
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // EMERGENCY FIX: Create a completely new set of Q&A items that will definitely work
    fixQuestionsAndAnswers();
    
    // Initialize FAQ accordion functionality
    initAccordion();
    
    // Initialize image modal functionality
    initImageModal();
    
    // Initialize scroll animations specific to the tournament guide
    initTournamentScrollAnimations();
    
    // Back to top button functionality
    var backToTopButton = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// EMERGENCY FIX: Direct replacement of Q&A elements to fix visibility issues
function fixQuestionsAndAnswers() {
    // Find all QA sections
    const qaLists = document.querySelectorAll('.qa-list');
    
    if (qaLists.length === 0) return;
    
    qaLists.forEach(qaList => {
        // Get all existing QA items
        const qaItems = qaList.querySelectorAll('.qa-item');
        
        // Store the content to recreate
        const qaData = [];
        
        // Extract the content from each QA item
        qaItems.forEach(item => {
            const questionEl = item.querySelector('.question');
            const answerEl = item.querySelector('.answer');
            
            if (questionEl && answerEl) {
                qaData.push({
                    id: item.id || '',
                    questionText: questionEl.innerHTML,
                    answerText: answerEl.innerHTML
                });
            }
        });
        
        // Clear the list
        qaList.innerHTML = '';
        
        // Recreate the QA items with proper structure
        qaData.forEach(qa => {
            const newItem = document.createElement('li');
            newItem.className = 'qa-item';
            if (qa.id) newItem.id = qa.id;
            
            const question = document.createElement('button');
            question.className = 'question';
            question.innerHTML = qa.questionText;
            question.style.background = 'rgba(20, 20, 30, 0.4)';
            question.style.color = '#fff';
            question.style.borderLeft = '3px solid #3498db';
            question.style.padding = '15px 50px 15px 20px';
            question.style.borderRadius = '4px';
            question.style.fontWeight = '500';
            question.style.letterSpacing = '0.5px';
            question.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            question.style.backdropFilter = 'blur(5px)';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'question-progress';
            progressBar.style.background = 'linear-gradient(to right, #3498db, #e74c3c)';
            progressBar.style.transition = 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
            progressBar.style.borderRadius = '0 3px 3px 0';
            question.appendChild(progressBar);
            
            const answer = document.createElement('div');
            answer.className = 'answer';
            answer.innerHTML = qa.answerText;
            answer.style.maxHeight = '0';
            answer.style.padding = '0 25px';
            answer.style.opacity = '0';
            answer.style.color = 'rgba(255, 255, 255, 0.9)';
            answer.style.background = 'rgba(15, 15, 25, 0.3)';
            answer.style.lineHeight = '1.6';
            answer.style.borderRadius = '0 4px 4px 0';
            answer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            answer.style.backdropFilter = 'blur(5px)';
            
            newItem.appendChild(question);
            newItem.appendChild(answer);
            
            // Add click handler directly
            question.addEventListener('click', function() {
                // Toggle active class
                newItem.classList.toggle('active');
                
                // Update progress bar and answer visibility
                if (newItem.classList.contains('active')) {
                    progressBar.style.width = '100%';
                    answer.style.maxHeight = '500px';
                    answer.style.padding = '20px 25px';
                    answer.style.opacity = '1';
                    answer.style.background = 'rgba(15, 15, 25, 0.3)';
                    answer.style.borderLeft = '3px solid #e74c3c';
                    answer.style.marginLeft = '15px';
                    answer.style.marginBottom = '15px';
                    
                    question.style.borderLeftColor = '#e74c3c';
                    question.style.background = 'rgba(30, 30, 40, 0.6)';
                } else {
                    progressBar.style.width = '0';
                    answer.style.maxHeight = '0';
                    answer.style.padding = '0 25px';
                    answer.style.opacity = '0';
                    answer.style.marginLeft = '15px';
                    answer.style.marginBottom = '0';
                    
                    question.style.borderLeftColor = '#3498db';
                    question.style.background = 'rgba(20, 20, 30, 0.4)';
                }
            });
            
            qaList.appendChild(newItem);
        });
        
        // Apply additional styles to ensure visibility
        qaList.style.display = 'block';
        qaList.style.visibility = 'visible';
        qaList.style.opacity = '1';
        
        const newQaItems = qaList.querySelectorAll('.qa-item');
        newQaItems.forEach(item => {
            item.style.display = 'block';
            item.style.visibility = 'visible';
            item.style.opacity = '1';
            
            const q = item.querySelector('.question');
            if (q) {
                q.style.display = 'block';
                q.style.visibility = 'visible';
                q.style.opacity = '1';
            }
        });
    });
}

// Initialize accordion functionality for Q&A sections - This is no longer used
function initAccordion() {
    // The functionality is now handled in the fixQuestionsAndAnswers function
}

// Initialize image modal functionality
function initImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');
    const guideImages = document.querySelectorAll('.guide-img');
    
    if (!modal || !modalImage || !closeModal) return;
    
    guideImages.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = 'flex';
            modalImage.src = this.src;
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close modal when clicking outside of the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
}

// Initialize tournament-specific scroll animations
function initTournamentScrollAnimations() {
    // Apply staggered reveal to sections
    const guideSections = document.querySelectorAll('.guide-section');
    
    // Only add animation classes if they don't already have them
    guideSections.forEach((section, index) => {
        // Add delay based on section position
        section.style.transitionDelay = `${0.1 * index}s`;
        
        // Make sure the section will be visible once in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                    
                    // Make sure any QA items in this section are visible
                    const qaItems = entry.target.querySelectorAll('.qa-item');
                    qaItems.forEach(item => {
                        item.style.display = 'block';
                        item.style.visibility = 'visible';
                        item.style.opacity = '1';
                        
                        const question = item.querySelector('.question');
                        if (question) {
                            question.style.display = 'block';
                            question.style.visibility = 'visible';
                            question.style.opacity = '1';
                        }
                    });
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(section);
    });
    
    // Apply subtle parallax effect to section headings
    const sectionTitles = document.querySelectorAll('.section-title');
    window.addEventListener('scroll', throttle(function() {
        sectionTitles.forEach(title => {
            const rect = title.getBoundingClientRect();
            const scrollPos = window.scrollY;
            
            // Only apply effect when section is in viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const distance = (window.innerHeight - rect.top) * 0.05;
                title.style.transform = `translateX(${distance}px)`;
                
                // Add subtle color change for more visual interest
                const opacity = Math.min(1, Math.abs(distance) / 30);
                title.style.borderLeftColor = `rgba(231, 76, 60, ${0.7 + opacity * 0.3})`;
            }
        });
    }, 50));
    
    // Add highlight effect to info cards when they become visible
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach(card => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    card.classList.add('highlight-pulse');
                    setTimeout(() => {
                        card.classList.remove('highlight-pulse');
                    }, 1000);
                    observer.unobserve(card);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(card);
    });
}

// Throttle function to limit function calls during scroll
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

// Add highlight pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight-pulse {
        0% { box-shadow: 0 0 5px rgba(52, 152, 219, 0.7); }
        50% { box-shadow: 0 0 20px rgba(52, 152, 219, 0.9); }
        100% { box-shadow: 0 0 5px rgba(52, 152, 219, 0.7); }
    }
    
    .highlight-pulse {
        animation: highlight-pulse 1s ease;
    }
    
    /* Emergency fixes for QA visibility */
    .qa-list, .qa-item, .question {
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
    }
    
    .question {
        pointer-events: auto !important;
        cursor: pointer !important;
        background: rgba(20, 20, 30, 0.4) !important;
        color: #fff !important;
        border-left: 3px solid #3498db !important;
        padding: 15px 50px 15px 20px !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        font-weight: 500 !important;
        letter-spacing: 0.5px !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
        transition: all 0.3s ease !important;
    }
    
    .question:hover {
        background: rgba(30, 30, 40, 0.5) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    }
    
    .qa-item.active .question {
        border-left-color: #e74c3c !important;
        background: rgba(30, 30, 40, 0.6) !important;
    }
    
    .qa-item:not(.active) .answer {
        max-height: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        opacity: 0 !important;
        overflow: hidden !important;
    }
    
    .qa-item.active .answer {
        max-height: 500px !important;
        padding: 20px 25px !important;
        opacity: 1 !important;
        background: rgba(15, 15, 25, 0.3) !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-left: 3px solid #e74c3c !important;
        margin-left: 15px !important;
        margin-bottom: 15px !important;
        line-height: 1.6 !important;
        border-radius: 0 4px 4px 0 !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
    }
    
    .answer .highlight {
        color: #e74c3c !important;
        font-weight: 600 !important;
    }
    
    .question-progress {
        background: linear-gradient(to right, #3498db, #e74c3c) !important; 
        transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
    }
`;
document.head.appendChild(style); 