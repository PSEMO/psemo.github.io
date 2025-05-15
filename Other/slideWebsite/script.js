const totalImages = 12; // Number of images (0.png to 11.png)
const imageBaseName = "img/";
const imageExtension = ".png";

let currentSlideIndex = 0;
const images = [];

// Populate the images array
for (let i = 0; i < totalImages; i++) {
    images.push(`${imageBaseName}${i}${imageExtension}`);
}

const slideImageElement = document.getElementById('slideImage');
const slideElement = document.querySelector('.slide'); // Get the slide div
const dotsContainer = document.querySelector('.dots-container');

// Create dots
for (let i = 0; i < images.length; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.setAttribute('onclick', `showSlide(${i})`);
    dotsContainer.appendChild(dot);
}
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    // Boundary checks
    if (index >= images.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = images.length - 1;
    } else {
        currentSlideIndex = index;
    }

    // Update image source
    slideImageElement.src = images[currentSlideIndex];
    slideImageElement.alt = `Slide ${currentSlideIndex + 1}`;

    // Add 'active' class to the slide for CSS animations/visibility
    slideElement.classList.remove('active'); // Remove from any previous
    void slideElement.offsetWidth; // Trigger reflow for animation restart
    slideElement.classList.add('active');

    // Update active dot
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }
}

function changeSlide(n) {
    showSlide(currentSlideIndex + n);
}

// Auto-play
let autoPlayInterval;
const autoPlayDelay = 6000; // 3 seconds

function startAutoPlay() {
    stopAutoPlay(); // Clear any existing interval
    autoPlayInterval = setInterval(() => {
        changeSlide(1);
    }, autoPlayDelay);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Initialize the first slide
showSlide(currentSlideIndex);

// Start auto-play
startAutoPlay();

// Pause autoplay on mouse hover over the slideshow
//const slideshowContainer = document.querySelector('.slideshow-container');
//if (slideshowContainer) {
//    slideshowContainer.addEventListener('mouseenter', stopAutoPlay);
//    slideshowContainer.addEventListener('mouseleave', startAutoPlay);
//}