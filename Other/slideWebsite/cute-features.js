document.addEventListener('DOMContentLoaded', () => {
    const heartsContainer = document.querySelector('.falling-hearts');
    const numHearts = 25; // Number of falling hearts
    const heartEmojis = ['💖', '💕', '💗', '💓', '💞', '💜', '✨']; // Added purple heart and sparkle

    if (heartsContainer) {
        for (let i = 0; i < numHearts; i++) {
            createFallingHeart(heartsContainer);
        }
    }

    createMouseTrail();

    document.body.addEventListener('click', (event) => {
        // Avoid creating click hearts if clicking on nav buttons or dots
        if (event.target.closest('.prev, .next, .dot')) {
            return;
        }
        createClickHeart(event.clientX, event.clientY);
    });

    // Enhance slide change with sparkle
    const originalShowSlide = window.showSlide;
    if (typeof originalShowSlide === 'function') {
        window.showSlide = function (...args) {
            originalShowSlide.apply(this, args); // Call original function

            const slideImage = document.getElementById('slideImage');
            if (slideImage) {
                slideImage.style.animation = 'none';
                void slideImage.offsetWidth; // Trigger reflow
                slideImage.style.animation = 'imageSparkle 0.7s ease-out';
            }
        };
    } else {
        console.error("Original showSlide function not found. Sparkle effect on image change might not work.");
    }
});

function createFallingHeart(container) {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

    // Add different color classes randomly
    const typeRandom = Math.random();
    if (typeRandom > 0.66) heart.classList.add('type2');
    else if (typeRandom > 0.33) heart.classList.add('type3');


    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = Math.random() * 18 + 10 + 'px'; // Random size: 10px to 28px

    const fallDuration = Math.random() * 6 + 7; // 7-13 seconds to fall
    const swayDuration = Math.random() * 3 + 3; // 3-6 seconds for a sway cycle

    heart.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
    heart.style.animationDelay = Math.random() * 7 + 's'; // Stagger start times up to 7s
    heart.style.opacity = Math.random() * 0.6 + 0.3; // Random opacity 0.3 to 0.9

    container.appendChild(heart);

    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
            // Create a new one to maintain the count
            createFallingHeart(container);
        }
    }, (fallDuration + parseFloat(heart.style.animationDelay || 0)) * 1000 + 1000);
}

function createMouseTrail() {
    const trailCount = 8;
    const trailElements = [];
    const trailColors = ['#ff7eb9', '#f8c8dc', '#ffabe1', '#d8baff', '#c597fa']; // Added more purplish pastels

    for (let i = 0; i < trailCount; i++) {
        const trailEl = document.createElement('div');
        trailEl.style.position = 'fixed';
        trailEl.style.width = `${12 - i * 0.7}px`;
        trailEl.style.height = `${12 - i * 0.7}px`;
        trailEl.style.backgroundColor = trailColors[i % trailColors.length];
        trailEl.style.borderRadius = '50%';
        trailEl.style.pointerEvents = 'none';
        trailEl.style.opacity = 0; // Start hidden
        trailEl.style.zIndex = 9999;
        trailEl.style.transition = 'transform 0.05s linear, opacity 0.1s linear';
        trailEl.style.transform = 'translate(-50%, -50%) scale(0)';
        document.body.appendChild(trailEl);
        trailElements.push({ el: trailEl, x: 0, y: 0 });
    }

    let mouseX = 0;
    let mouseY = 0;
    let animationFrameId = null;
    let lastMoveTime = Date.now();

    function updateTrailPosition() {
        for (let i = 0; i < trailCount; i++) {
            const trail = trailElements[i];
            const targetX = (i === 0) ? mouseX : trailElements[i - 1].x;
            const targetY = (i === 0) ? mouseY : trailElements[i - 1].y;

            trail.x += (targetX - trail.x) * 0.4; // Smoother follow
            trail.y += (targetY - trail.y) * 0.4;

            trail.el.style.left = trail.x + 'px';
            trail.el.style.top = trail.y + 'px';
        }
        animationFrameId = requestAnimationFrame(updateTrailPosition);
    }

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        lastMoveTime = Date.now();

        trailElements.forEach((t, index) => {
            t.el.style.opacity = 1 - index / trailCount;
            t.el.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        if (!animationFrameId) {
            updateTrailPosition();
        }
    });

    // Hide trail after mouse stops moving
    setInterval(() => {
        if (Date.now() - lastMoveTime > 500 && animationFrameId) { // 0.5s inactivity
            trailElements.forEach(t => {
                t.el.style.opacity = 0;
                t.el.style.transform = 'translate(-50%, -50%) scale(0)';
            });
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }, 200);
}

function createClickHeart(x, y) {
    const clickHeart = document.createElement('div');
    const clickHeartEmojis = ['💖', '✨', '💕', '⭐', '💜'];
    clickHeart.innerHTML = clickHeartEmojis[Math.floor(Math.random() * clickHeartEmojis.length)];
    clickHeart.style.position = 'fixed';
    clickHeart.style.left = x + 'px';
    clickHeart.style.top = y + 'px';
    clickHeart.style.fontSize = `${Math.random() * 16 + 18}px`; // 18px to 34px
    clickHeart.style.color = ['#ff7eb9', '#ffabe1', '#f8c8dc', '#e6e6fa'][Math.floor(Math.random() * 4)];
    clickHeart.style.pointerEvents = 'none';
    clickHeart.style.userSelect = 'none';
    clickHeart.style.transform = 'translate(-50%, -50%)';
    clickHeart.style.zIndex = 10000;
    clickHeart.style.textShadow = '0 0 5px rgba(255,255,255,0.7)';
    document.body.appendChild(clickHeart);

    clickHeart.animate([
        { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(-50%, -${Math.random() * 60 + 60}%) scale(${Math.random() * 0.5 + 1}) rotate(${Math.random() * 60 - 30}deg)`, opacity: 0 }
    ], {
        duration: 800 + Math.random() * 400, // 800ms to 1200ms
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Cute bounce ease
    });

    setTimeout(() => {
        if (clickHeart.parentNode) {
            clickHeart.parentNode.removeChild(clickHeart);
        }
    }, 1200);
}