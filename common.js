/**
 * This script contains shared functionality for the entire site,
 * including the particle background, popup modal, and footer updates.
 * It is designed to run on any page without errors by checking for the
 * existence of required HTML elements before executing code.
 */

/**
 * --- Particle System ---
 * Creates an interactive particle background on a canvas element.
 * Particles react to mouse movement.
 */
const initParticleSystem = () => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return; // Exit if canvas isn't on the page

    const ctx = canvas.getContext('2d');
    let particlesArray;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mouse = { x: null, y: null, radius: (canvas.height / 90) * (canvas.width / 90) };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });
    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = (canvas.height / 90) * (canvas.width / 90);
        createParticles(); // Re-create particles for new screen size
    });

    class Particle {
        constructor(x, y, dirX, dirY, size) {
            this.x = x; this.y = y;
            this.directionX = dirX; this.directionY = dirY;
            this.size = size; this.baseSize = size;
            this.color = 'hsl(204, 100%, 50%)';
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

            const distance = mouse.x != null ? Math.hypot(this.x - mouse.x, this.y - mouse.y) : mouse.radius + 1;
            if (distance < mouse.radius) {
                const proximity = 1 - (distance / mouse.radius);
                this.color = `hsl(204, 100%, ${50 + 50 * proximity}%)`;
                this.size = this.baseSize + 2 * proximity;
            } else {
                this.color = 'hsl(204, 100%, 50%)';
                this.size = this.baseSize;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function createParticles() {
        particlesArray = [];
        const numberOfParticles = (canvas.height * canvas.width) / 11000;
        for (let i = 0; i < numberOfParticles; i++) {
            const size = (Math.random() * 2) + 1;
            const x = (Math.random() * (innerWidth - size * 2)) + size * 2;
            const y = (Math.random() * (innerHeight - size * 2)) + size * 2;
            const directionX = (Math.random() * 0.4) - 0.2;
            const directionY = (Math.random() * 0.4) - 0.2;
            particlesArray.push(new Particle(x, y, directionX, directionY, size));
        }
    }

    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const distance = Math.hypot(particlesArray[a].x - particlesArray[b].x, particlesArray[a].y - particlesArray[b].y);
                if (distance < (canvas.width / 8)) {
                    const opacity = 1 - (distance / (canvas.width / 8));
                    ctx.strokeStyle = `hsla(204, 100%, 70%, ${opacity * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        particlesArray.forEach(p => p.update());
        connect();
    }

    createParticles();
    animate();
};

/**
 * --- Popup Modal ---
 * Handles opening and closing of the profile picture modal.
 */
const initPopupModal = () => {
    const profilePicButton = document.getElementById('profilePicButton');
    const imagePopup = document.getElementById('imagePopup');
    const closePopupButton = document.getElementById('closePopup');

    if (!profilePicButton || !imagePopup || !closePopupButton) return; // Exit if elements don't exist

    const openPopup = () => {
        imagePopup.classList.add('visible');
        imagePopup.setAttribute('aria-hidden', 'false');
        setTimeout(() => closePopupButton.focus(), 50);
    };

    const closePopup = () => {
        imagePopup.classList.remove('visible');
        imagePopup.setAttribute('aria-hidden', 'true');
        profilePicButton.focus();
    };

    profilePicButton.addEventListener('click', openPopup);
    closePopupButton.addEventListener('click', closePopup);
    imagePopup.addEventListener('click', (event) => {
        if (event.target === imagePopup) closePopup();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && imagePopup.classList.contains('visible')) {
            closePopup();
        }
    });
};

/**
 * --- Footer Year ---
 * Updates the span with the ID 'current-year' to the current year.
 */
const updateFooterYear = () => {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
};


// --- Main Execution ---
// When the document is loaded, run all the initializers.
document.addEventListener('DOMContentLoaded', () => {
    initParticleSystem();
    initPopupModal();
    updateFooterYear();
});