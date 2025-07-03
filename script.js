// Ad Slider Infinite Scroll
document.addEventListener('DOMContentLoaded', function () {
    // Set current year in footer
    document.getElementById('footer-text-year').textContent = new Date().getFullYear();
    
    // Animate specialty items with staggered delay
    const specialtyItems = document.querySelectorAll('.specialty-item');
    specialtyItems.forEach((item, index) => {
        item.style.setProperty('--i', index);
    });
    
    // Telehealth icon subtle animation
    const teleHealthIcon = document.querySelector('.telehealth-icon');
    if (teleHealthIcon) {
        let scale = 1;
        let growing = false;
        
        function animateTelehealthIcon() {
            if (growing) {
                scale += 0.001;
                if (scale >= 1.05) {
                    growing = false;
                }
            } else {
                scale -= 0.001;
                if (scale <= 0.95) {
                    growing = true;
                }
            }
            
            teleHealthIcon.style.transform = `scale(${scale})`;
            requestAnimationFrame(animateTelehealthIcon);
        }
        
        // Start the animation
        animateTelehealthIcon();
    }
    
    const slider = document.getElementById('adSlider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.ad-slide');
    const slideWidth = slides[0].offsetWidth + 20; // width + gap
    let currentIndex = 0;
    let isTransitioning = false;
    let autoSlideInterval;

    // Clone slides for infinite effect
    const originalSlides = Array.from(slides);
    originalSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        slider.appendChild(clone);
    });

    function getVisibleSlides() {
        const containerWidth = slider.parentElement.offsetWidth;
        if (window.innerWidth <= 768) {
            return 1.5; // Mobile: show 1.5 slides
        } else if (window.innerWidth <= 992) {
            return 2; // Tablet: show 2 slides
        } else {
            return 3; // Desktop: show 3 slides
        }
    }

    function moveToSlide(index, smooth = true) {
        if (isTransitioning) return;

        isTransitioning = true;
        const visibleSlides = getVisibleSlides();
        const slidePercentage = window.innerWidth <= 768 ? 66.67 : (100 / visibleSlides);
        const translateX = -(index * slidePercentage);

        if (smooth) {
            slider.style.transition = 'transform 0.5s ease';
        } else {
            slider.style.transition = 'none';
        }

        slider.style.transform = `translateX(${translateX}%)`;

        setTimeout(() => {
            isTransitioning = false;

            // Reset to beginning when reaching the end
            if (index >= originalSlides.length) {
                currentIndex = 0;
                moveToSlide(0, false);
            }
        }, smooth ? 500 : 0);
    }

    function nextSlide() {
        currentIndex++;
        moveToSlide(currentIndex);
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Initialize
    moveToSlide(0, false);
    startAutoSlide();

    // Pause on hover
    slider.parentElement.addEventListener('mouseenter', stopAutoSlide);
    slider.parentElement.addEventListener('mouseleave', startAutoSlide);

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            moveToSlide(currentIndex, false);
        }, 250);
    });

    // Mouse wheel scrolling
    let wheelTimeout;
    slider.parentElement.addEventListener('wheel', function (e) {
        e.preventDefault();
        stopAutoSlide();

        // Clear any existing timeout
        clearTimeout(wheelTimeout);

        if (e.deltaY > 0) {
            // Scroll down - next slide
            nextSlide();
        } else {
            // Scroll up - previous slide
            currentIndex = currentIndex > 0 ? currentIndex - 1 : originalSlides.length - 1;
            moveToSlide(currentIndex);
        }

        // Restart auto-slide after a delay, but clear previous timeouts
        wheelTimeout = setTimeout(startAutoSlide, 3000);
    });

    // Mouse drag support for desktop
    let startX = 0;
    let isDragging = false;
    let hasDragged = false;
    let dragTimeout;

    slider.addEventListener('mousedown', function (e) {
        startX = e.clientX;
        isDragging = true;
        hasDragged = false;
        stopAutoSlide();
        clearTimeout(dragTimeout);
        slider.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        hasDragged = true;
        e.preventDefault();
    });

    document.addEventListener('mouseup', function (e) {
        if (!isDragging) return;

        if (hasDragged) {
            const endX = e.clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) { // Minimum drag distance
                if (diffX > 0) {
                    nextSlide(); // Drag left - next slide
                } else {
                    // Drag right - previous slide
                    currentIndex = currentIndex > 0 ? currentIndex - 1 : originalSlides.length - 1;
                    moveToSlide(currentIndex);
                }
            }
        }

        isDragging = false;
        hasDragged = false;
        slider.style.cursor = 'grab';
        
        // Restart auto-slide after a longer delay for drag actions
        dragTimeout = setTimeout(startAutoSlide, 4000);
    });

    // Touch/swipe support for mobile
    let touchTimeout;
    slider.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoSlide();
        clearTimeout(touchTimeout);
    });

    slider.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
    });

    slider.addEventListener('touchend', function (e) {
        if (!isDragging) return;

        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;

        if (Math.abs(diffX) > 50) { // Minimum swipe distance
            if (diffX > 0) {
                nextSlide(); // Swipe left - next slide
            } else {
                // Swipe right - previous slide
                currentIndex = currentIndex > 0 ? currentIndex - 1 : originalSlides.length - 1;
                moveToSlide(currentIndex);
            }
        }

        isDragging = false;
        
        // Restart auto-slide after a delay for touch actions
        touchTimeout = setTimeout(startAutoSlide, 4000);
    });
});