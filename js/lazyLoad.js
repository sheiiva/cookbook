// Lazy loading implementation
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Preload critical images only if they're likely to be viewed soon
function preloadCriticalImages() {
    // Only preload if we're on a page that might show these images
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/index.html';
    const isRecipePage = currentPath.includes('/recipes/');
    
    // Only preload on homepage or if we're likely to navigate to these recipes
    if (isHomePage) {
        const criticalImages = [
            'images/optimized/banana_bread.webp',
            'images/optimized/bourguignon.webp'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            link.setAttribute('fetchpriority', 'high');
            document.head.appendChild(link);
        });
    }
}

// Initialize preloading with a small delay to ensure DOM is ready
setTimeout(preloadCriticalImages, 100); 