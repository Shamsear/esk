// Fix filter button position
document.addEventListener('DOMContentLoaded', function() {
    // Apply fix to filter button
    const filterBtn = document.querySelector('.filter-btn');
    if (filterBtn) {
        // Apply direct style to ensure it's fixed to viewport
        filterBtn.style.position = 'fixed';
        filterBtn.style.bottom = '20px';
        filterBtn.style.right = '20px';
        filterBtn.style.zIndex = '1000';
        filterBtn.style.display = 'flex';
        
        // Remove any existing inline styles that might interfere
        filterBtn.style.top = '';
        filterBtn.style.transform = '';
        
        // Make sure it's not inside a positioned container
        document.body.appendChild(filterBtn);
    }
    
    // Add padding to pagination
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.style.marginBottom = '70px';
    }
}); 