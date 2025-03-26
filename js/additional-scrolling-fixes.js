
// Additional fixes for specific scrolling issues
document.addEventListener('DOMContentLoaded', function() {
  // Fix 1: Handle table overflow
  const tables = document.querySelectorAll('table');
  tables.forEach(function(table) {
    // Wrap table in a container with horizontal scroll if needed
    const wrapper = document.createElement('div');
    wrapper.style.overflowX = 'auto';
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '100%';
    
    // Replace table with wrapped version
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
  
  // Fix 2: Handle long text in small containers
  const textContainers = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, .text-content');
  textContainers.forEach(function(container) {
    container.style.overflowWrap = 'break-word';
    container.style.wordWrap = 'break-word';
    container.style.hyphens = 'auto';
    container.style.maxWidth = '100%';
  });
  
  // Fix 3: Handle fixed position elements
  const fixedElements = document.querySelectorAll('.fixed-element, .back-to-top, .top-bar');
  fixedElements.forEach(function(element) {
    element.style.maxWidth = '100%';
    element.style.width = 'auto';
    element.style.right = '0';
    element.style.left = '0';
    element.style.boxSizing = 'border-box';
  });
  
  // Fix 4: Force the body to maintain width
  function enforceBodyWidth() {
    document.body.style.maxWidth = '100%';
    document.body.style.overflowX = 'hidden';
  }
  
  // Apply initially and on resize
  enforceBodyWidth();
  window.addEventListener('resize', enforceBodyWidth);
});