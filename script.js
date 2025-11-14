/**
 * This script contains functionality specific to the index.html page.
 * It handles:
 * 1. The staggered animation for the link items on load.
 * 2. The expand/collapse functionality for the showcase items.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Animate link items on load
    const links = document.querySelectorAll('.link-item');

    if (links.length > 0) {
        links.forEach((link, index) => {
            const delay = index * 75 + 200;
            link.style.transition = `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`;
            requestAnimationFrame(() => {
                link.style.opacity = '1';
                link.style.transform = 'translateY(0)';
            });
        });
    }

    // 2. Handle showcase item expansion
    const showcaseContainer = document.querySelector('.showcase-container');
    if (showcaseContainer) {
        const showcaseItems = showcaseContainer.querySelectorAll('.showcase-item');

        showcaseContainer.addEventListener('click', (event) => {
            const header = event.target.closest('.showcase-header');
            if (!header) return; // Exit if the click was not on a header

            const currentItem = header.closest('.showcase-item');
            if (!currentItem) return;

            const isExpanded = currentItem.classList.contains('expanded');

            // Close all other items
            showcaseItems.forEach(item => {
                if (item !== currentItem) {
                    item.classList.remove('expanded');
                }
            });

            // Toggle the clicked item
            if (!isExpanded) {
                currentItem.classList.add('expanded');
            } else {
                currentItem.classList.remove('expanded');
            }
        });
    }
});