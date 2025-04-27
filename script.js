document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const profilePicButton = document.getElementById('profilePicButton');
    const imagePopup = document.getElementById('imagePopup');
    const closePopupButton = document.getElementById('closePopup');
    const currentYearSpan = document.getElementById('current-year');
    const links = document.querySelectorAll('.link-item'); // Get all link items

    // --- Popup Logic ---
    const openPopup = () => {
        if (imagePopup && closePopupButton) {
            imagePopup.classList.add('visible');
            imagePopup.setAttribute('aria-hidden', 'false');
            // Delay focus slightly to allow transition to start
            setTimeout(() => closePopupButton.focus(), 50);
        }
    };

    const closePopup = () => {
        if (imagePopup && profilePicButton) {
            imagePopup.classList.remove('visible');
            imagePopup.setAttribute('aria-hidden', 'true');
            profilePicButton.focus(); // Return focus to the button that opened it
        }
    };

    // --- Event Listeners ---

    // Open popup
    if (profilePicButton) {
        profilePicButton.addEventListener('click', openPopup);
    }

    // Close popup with button
    if (closePopupButton) {
        closePopupButton.addEventListener('click', closePopup);
    }

    // Close popup clicking overlay
    if (imagePopup) {
        imagePopup.addEventListener('click', (event) => {
            // Only close if the click is directly on the overlay
            if (event.target === imagePopup) {
                closePopup();
            }
        });
    }

    // Close popup with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && imagePopup?.classList.contains('visible')) {
            closePopup();
        }
    });

    // --- Footer Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Staggered Link Animation on Load ---
    if (links.length > 0) {
        links.forEach((link, index) => {
            // Calculate delay based on index
            const delay = index * 75 + 200; // Base delay + stagger (in milliseconds)
            link.style.transition = `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`;

            // Trigger reflow/repaint to apply initial styles before setting final styles
            // Using requestAnimationFrame for better performance/reliability than offsetWidth
            requestAnimationFrame(() => {
                link.style.opacity = '1';
                link.style.transform = 'translateY(0)';
            });
        });
    }

}); // End DOMContentLoaded