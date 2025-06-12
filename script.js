/**
 * This script contains functionality specific to the index.html page.
 * It handles the staggered animation for the link items on load.
 */
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.link-item');

    if (links.length > 0) {
        links.forEach((link, index) => {
            // Calculate a staggered delay for each link
            const delay = index * 75 + 200; // Base delay + stagger
            link.style.transition = `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`;

            // Use a minimal timeout or rAF to ensure the initial (invisible) state is rendered first
            requestAnimationFrame(() => {
                link.style.opacity = '1';
                link.style.transform = 'translateY(0)';
            });
        });
    }
});