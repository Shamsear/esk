// Test script to verify animation flow on managers page
// Run this in browser console to test animation consistency

function testAnimationFlow() {
    console.log('🔍 Testing Manager Page Animation Flow...');
    
    // Test 1: Check if conflicting animation classes exist
    const elementsWithFadeIn = document.querySelectorAll('.fade-in');
    const elementsWithManagerCard = document.querySelectorAll('.manager-card');
    const elementsWithHidden = document.querySelectorAll('.hidden');
    
    console.log(`📊 Animation Element Counts:
    - Elements with .fade-in: ${elementsWithFadeIn.length}
    - Elements with .manager-card: ${elementsWithManagerCard.length}
    - Elements with .hidden: ${elementsWithHidden.length}`);
    
    // Test 2: Check animation timing consistency
    const fadeInElements = Array.from(elementsWithFadeIn);
    const timingAnalysis = fadeInElements.map((el, index) => {
        const computedStyle = window.getComputedStyle(el);
        return {
            element: el.className,
            transitionDelay: computedStyle.transitionDelay,
            transitionDuration: computedStyle.transitionDuration,
            hasActiveClass: el.classList.contains('active')
        };
    });
    
    console.log('⏱️ Timing Analysis:', timingAnalysis);
    
    // Test 3: Check for mobile responsiveness
    const isMobile = window.innerWidth <= 768;
    console.log(`📱 Device Type: ${isMobile ? 'Mobile' : 'Desktop'}`);
    
    // Test 4: Simulate manager card animation
    const managerCards = Array.from(elementsWithManagerCard).filter(el => !el.classList.contains('skeleton'));
    console.log(`🃏 Manager Cards Found: ${managerCards.length}`);
    
    // Test 5: Check intersection observer
    const managersContainer = document.querySelector('.managers-container');
    if (managersContainer) {
        console.log('✅ Managers container found');
        const containerRect = managersContainer.getBoundingClientRect();
        console.log(`📐 Container Position: ${containerRect.top < window.innerHeight ? 'In Viewport' : 'Below Viewport'}`);
    } else {
        console.log('❌ Managers container not found');
    }
    
    // Test 6: Animation sequence verification
    setTimeout(() => {
        const activeElements = document.querySelectorAll('.active');
        console.log(`🎬 Active animated elements after 2s: ${activeElements.length}`);
        
        const cardStats = {
            total: managerCards.length,
            active: managerCards.filter(card => card.classList.contains('active')).length,
            inactive: managerCards.filter(card => !card.classList.contains('active')).length
        };
        
        console.log('📈 Manager Card Animation Status:', cardStats);
        
        if (cardStats.active === cardStats.total && cardStats.total > 0) {
            console.log('✅ All manager cards animated successfully!');
        } else if (cardStats.active > 0) {
            console.log('⚠️ Partial animation - some cards may still be animating');
        } else {
            console.log('❌ No manager cards animated - check intersection observer');
        }
    }, 2000);
    
    return 'Animation flow test completed. Check console for results.';
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = testAnimationFlow;
} else if (typeof window !== 'undefined') {
    window.testAnimationFlow = testAnimationFlow;
}

console.log('🧪 Animation Test Script Loaded. Run testAnimationFlow() to test.');
