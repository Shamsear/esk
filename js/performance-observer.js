// Performance observer for delayed content loading
document.addEventListener('DOMContentLoaded', function() {
  // Only run if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    // Create options for the observer
    const options = {
      rootMargin: '200px 0px',
      threshold: 0.01
    };
    
    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Element is now visible
          const element = entry.target;
          
          // Handle background images
          if (element.dataset.background) {
            element.style.backgroundImage = `url('${element.dataset.background}')`;
            delete element.dataset.background;
          }
          
          // Handle animations
          if (element.classList.contains('delayed-animation')) {
            element.classList.add('animated');
          }
          
          // Handle delayed content
          if (element.classList.contains('delayed-content') && element.dataset.content) {
            element.innerHTML = element.dataset.content;
            delete element.dataset.content;
          }
          
          // Stop observing this element
          observer.unobserve(element);
        }
      });
    }, options);
    
    // Observe elements with delay attributes
    document.querySelectorAll('[data-background], .delayed-animation, .delayed-content').forEach(el => {
      observer.observe(el);
    });
    
    // Add high priority fetch to visible images
    document.querySelectorAll('img').forEach(img => {
      if (isElementInViewport(img) && !img.getAttribute('fetchpriority')) {
        img.setAttribute('fetchpriority', 'high');
      }
    });
  }
  
  // Helper function to check if element is in viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
});
