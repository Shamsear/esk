/**
 * Tournament Guide Accordion and Interactive Features
 */
document.addEventListener('DOMContentLoaded', function() {
    // Plain simple accordion functionality
    var questionButtons = document.querySelectorAll('.question');
    
    for (var i = 0; i < questionButtons.length; i++) {
        questionButtons[i].addEventListener('click', function() {
            var qaItem = this.parentNode;
            var isActive = qaItem.classList.contains('active');
            
            // Close all first
            var allItems = document.querySelectorAll('.qa-item');
            for (var j = 0; j < allItems.length; j++) {
                allItems[j].classList.remove('active');
            }
            
            // If wasn't active, make it active
            if (!isActive) {
                qaItem.classList.add('active');
            }
        });
    }
    
    // Image modal functionality - simplified
    var images = document.querySelectorAll('.guide-img');
    var modal = document.getElementById('imageModal');
    var modalImg = document.getElementById('modalImage');
    var closeModal = document.querySelector('.close-modal');
    
    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('click', function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
        });
    }
    
    closeModal.addEventListener('click', function() {
        modal.style.display = "none";
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
    
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