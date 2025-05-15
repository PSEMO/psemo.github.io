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
const slideshowContainerElement = document.querySelector('.slideshow-container'); // Main container

let dots = []; // Will be populated after dots are created
let autoPlayInterval;
const autoPlayDelay = 6000; // 6 seconds

// --- PRELOADING FUNCTIONS ---
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => {
            console.error(`Failed to load image: ${src}`, err);
            // Resolve even on error to attempt to show slideshow with available images
            // If you want to prevent slideshow on any error, use reject()
            reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
    });
}

async function preloadAllSlideshowImages() {
    if (images.length === 0) {
        console.log("No images to preload.");
        return true; // Consider this a success for no images
    }
    const promises = images.map(src => preloadImage(src));
    try {
        await Promise.all(promises);
        console.log("All slideshow images preloaded successfully!");
        return true;
    } catch (error) {
        console.error("Error preloading one or more images:", error);
        if (slideshowContainerElement) {
            slideshowContainerElement.innerHTML = '<p style="color: #f8c8dc; text-align: center; padding: 20px;">Aww, some cute pictures couldn\'t load! 💔 Please try refreshing.</p>';
            slideshowContainerElement.style.visibility = 'visible'; // Show error
        }
        return false; // Preloading failed
    }
}

// --- SLIDESHOW CORE FUNCTIONS ---
function showSlide(index) {
    if (!images || images.length === 0) return;

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
    slideElement.classList.remove('active');
    void slideElement.offsetWidth; // Trigger reflow for animation restart
    slideElement.classList.add('active');

    // Update active dot
    if (dots && dots.length > 0) {
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentSlideIndex]) {
            dots[currentSlideIndex].classList.add('active');
        }
    }
}

function changeSlide(n) {
    showSlide(currentSlideIndex + n);
}

function startAutoPlay() {
    stopAutoPlay(); // Clear any existing interval
    autoPlayInterval = setInterval(() => {
        changeSlide(1);
    }, autoPlayDelay);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// --- INITIALIZE SLIDESHOW ---
function initializeSlideshow() {
    if (!slideshowContainerElement) {
        console.error("Slideshow container not found. Cannot initialize.");
        return;
    }

    if (images.length === 0) {
        slideshowContainerElement.innerHTML = '<p style="color: #f8c8dc; text-align: center; padding: 20px;">No images to show right now! 😢</p>';
        slideshowContainerElement.style.visibility = 'visible';
        return;
    }

    // Create dots
    dotsContainer.innerHTML = ''; // Clear any pre-existing (though unlikely)
    for (let i = 0; i < images.length; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.setAttribute('onclick', `showSlide(${i})`);
        dotsContainer.appendChild(dot);
    }
    dots = document.querySelectorAll('.dot'); // Populate dots array

    // Show the first slide
    showSlide(currentSlideIndex);

    // Start auto-play
    startAutoPlay();

    // Add hover listeners to pause/resume autoplay
    slideshowContainerElement.addEventListener('mouseenter', stopAutoPlay);
    slideshowContainerElement.addEventListener('mouseleave', startAutoPlay);

    // Make the slideshow visible
    slideshowContainerElement.style.visibility = 'visible';
}

// --- SCRIPT ENTRY POINT ---
document.addEventListener('DOMContentLoaded', async () => {
    if (slideshowContainerElement) {
        const preloadingSuccessful = await preloadAllSlideshowImages();
        if (preloadingSuccessful) {
            initializeSlideshow();
        }
        // If preloadingSuccessful is false, an error message is already shown by preloadAllSlideshowImages
    } else {
        console.error("Slideshow container element not found in the DOM.");
    }
});